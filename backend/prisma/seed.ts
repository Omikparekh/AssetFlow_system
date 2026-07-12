import prisma from "../src/config/database";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding database...");

  // 1. Create Permissions
  const permissionsData = [
    { name: "ViewDepartments", description: "Allows viewing department details and directory" },
    { name: "ManageDepartments", description: "Allows creating, updating, and deleting departments" },
    { name: "ViewEmployees", description: "Allows viewing employee list and details" },
    { name: "ManageEmployees", description: "Allows creating, updating, and deleting employee profiles" },
    { name: "ManageOrganization", description: "Allows managing organization profile and global settings" },
  ];

  const permissionsMap: Record<string, any> = {};
  for (const perm of permissionsData) {
    const dbPerm = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permissionsMap[perm.name] = dbPerm;
  }
  console.log(`Created ${Object.keys(permissionsMap).length} permissions.`);

  // 2. Create Roles
  const rolesData = [
    { name: "Admin", description: "System Administrator with full access" },
    { name: "Asset Manager", description: "Asset Manager responsible for registers and allocations" },
    { name: "Department Head", description: "Head of a specific department" },
    { name: "Employee", description: "Standard company employee" },
  ];

  const rolesMap: Record<string, any> = {};
  for (const role of rolesData) {
    const dbRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    rolesMap[role.name] = dbRole;
  }
  console.log(`Created ${Object.keys(rolesMap).length} roles.`);

  // 3. Link Roles and Permissions
  // Admin has all permissions, but the middleware bypasses for Admin. We can link them anyway.
  const adminPermissions = Object.values(permissionsMap);
  
  // Asset Manager permissions
  const managerPermissions = [
    permissionsMap["ViewDepartments"],
    permissionsMap["ViewEmployees"],
  ];

  // Department Head permissions
  const headPermissions = [
    permissionsMap["ViewDepartments"],
    permissionsMap["ViewEmployees"],
  ];

  // Employee permissions
  const employeePermissions: any[] = [];

  const roleLinks = [
    { role: rolesMap["Admin"], perms: adminPermissions },
    { role: rolesMap["Asset Manager"], perms: managerPermissions },
    { role: rolesMap["Department Head"], perms: headPermissions },
    { role: rolesMap["Employee"], perms: employeePermissions },
  ];

  for (const link of roleLinks) {
    for (const perm of link.perms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: link.role.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: link.role.id,
          permissionId: perm.id,
        },
      });
    }
  }
  console.log("Linked roles and permissions.");

  // 4. Create Default Admin User
  const adminEmail = "admin@assetflow.com";
  const existingAdmin = await prisma.user.findFirst({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("AdminPassword123", salt);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: "System Admin",
        employeeCode: "EMP-001",
        status: "ACTIVE",
        roleId: rolesMap["Admin"].id,
      },
    });
    console.log(`Default Admin user created: ${adminEmail} / AdminPassword123`);
  } else {
    console.log("Admin user already exists.");
  }

  const adminUser = await prisma.user.findUniqueOrThrow({ where: { email: adminEmail } });

  // 5. Seed selectable departments and employees for allocation workflows
  const departmentsData = [
    { name: "Engineering", departmentCode: "ENG", description: "Product and engineering team" },
    { name: "Operations", departmentCode: "OPS", description: "Business operations team" },
  ];
  const departmentMap: Record<string, any> = {};
  for (const department of departmentsData) {
    departmentMap[department.departmentCode] = await prisma.department.upsert({
      where: { departmentCode: department.departmentCode },
      update: { name: department.name, description: department.description, status: "ACTIVE" },
      create: { ...department, status: "ACTIVE", createdBy: adminUser.id },
    });
  }

  const employeePasswordHash = await bcrypt.hash("EmployeePassword123", 10);
  const employeesData = [
    { email: "priya.sharma@assetflow.com", fullName: "Priya Sharma", employeeCode: "DEMO-ENG-001", departmentCode: "ENG" },
    { email: "rahul.verma@assetflow.com", fullName: "Rahul Verma", employeeCode: "DEMO-OPS-001", departmentCode: "OPS" },
  ];
  for (const employee of employeesData) {
    await prisma.user.upsert({
      where: { email: employee.email },
      update: {
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
        status: "ACTIVE",
        roleId: rolesMap["Employee"].id,
        departmentId: departmentMap[employee.departmentCode].id,
      },
      create: {
        email: employee.email,
        passwordHash: employeePasswordHash,
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
        status: "ACTIVE",
        roleId: rolesMap["Employee"].id,
        departmentId: departmentMap[employee.departmentCode].id,
        createdBy: adminUser.id,
      },
    });
  }

  // 6. Seed Asset Categories, Brands, and Models
  console.log("Seeding Asset Categories, Brands, and Models...");
  const categories = [
    { name: "Laptops", description: "Portable personal computers" },
    { name: "Monitors", description: "Display screens for workstations" },
    { name: "Keyboards", description: "Input hardware" },
    { name: "Desks", description: "Office desks" },
    { name: "Chairs", description: "Ergonomic office chairs" },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cat of categories) {
    categoryMap[cat.name] = await prisma.assetCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        defaultWarranty: 12,
        depreciationType: "STRAIGHT_LINE",
      },
    });
  }

  const brands = ["Apple", "Dell", "Logitech", "Herman Miller", "Steelcase"];
  const brandMap: Record<string, any> = {};
  for (const b of brands) {
    brandMap[b] = await prisma.assetBrand.upsert({
      where: { name: b },
      update: {},
      create: { name: b },
    });
  }

  const models = [
    { name: "MacBook Pro 16", brand: "Apple", category: "Laptops" },
    { name: "MacBook Air M2", brand: "Apple", category: "Laptops" },
    { name: "UltraSharp 27", brand: "Dell", category: "Monitors" },
    { name: "MX Keys", brand: "Logitech", category: "Keyboards" },
    { name: "Aeron Chair", brand: "Herman Miller", category: "Chairs" },
  ];

  const modelMap: Record<string, any> = {};
  for (const m of models) {
    const brandId = brandMap[m.brand].id;
    const categoryId = categoryMap[m.category].id;
    modelMap[m.name] = await prisma.assetModel.upsert({
      where: {
        brandId_name: { brandId, name: m.name },
      },
      update: {},
      create: {
        name: m.name,
        brandId,
        categoryId,
      },
    });
  }

  // Available assets make the allocation selector useful immediately.
  const assetsData = [
    { assetTag: "LAP-001", serialNumber: "SN-MBP-001", model: "MacBook Pro 16", location: "IT Store", condition: "NEW", departmentCode: "ENG" },
    { assetTag: "MON-001", serialNumber: "SN-DEL-001", model: "UltraSharp 27", location: "IT Store", condition: "NEW", departmentCode: "ENG" },
    { assetTag: "KEY-001", serialNumber: "SN-LOG-001", model: "MX Keys", location: "IT Store", condition: "GOOD", departmentCode: "OPS" },
  ];

  for (const asset of assetsData) {
    const model = modelMap[asset.model];
    await prisma.asset.upsert({
      where: { assetTag: asset.assetTag },
      update: {
        serialNumber: asset.serialNumber,
        currentStatus: "AVAILABLE",
        location: asset.location,
        condition: asset.condition,
        categoryId: model.categoryId,
        brandId: model.brandId,
        modelId: model.id,
        departmentId: departmentMap[asset.departmentCode].id,
      },
      create: {
        assetTag: asset.assetTag,
        serialNumber: asset.serialNumber,
        currentStatus: "AVAILABLE",
        location: asset.location,
        condition: asset.condition,
        categoryId: model.categoryId,
        brandId: model.brandId,
        modelId: model.id,
        departmentId: departmentMap[asset.departmentCode].id,
        createdBy: adminUser.id,
      },
    });
  }

  // Give the sample employee an active asset so the employee return flow is visible and testable.
  const priya = await prisma.user.findUniqueOrThrow({ where: { email: "priya.sharma@assetflow.com" } });
  const demoLaptop = await prisma.asset.findUniqueOrThrow({ where: { assetTag: "LAP-001" } });
  const activeLaptopAllocation = await prisma.assetAllocation.findFirst({
    where: { assetId: demoLaptop.id, status: "ACTIVE" },
  });
  if (!activeLaptopAllocation) {
    await prisma.assetAllocation.create({
      data: {
        assetId: demoLaptop.id,
        employeeId: priya.id,
        allocatedById: adminUser.id,
        status: "ACTIVE",
        notes: "Demo employee allocation",
      },
    });
  }
  await prisma.asset.update({ where: { id: demoLaptop.id }, data: { currentStatus: "ALLOCATED" } });

  await prisma.assetCharge.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: { amount: 250, status: "PENDING", employeeId: priya.id, employeeName: priya.fullName, assetTag: "LAP-001" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      title: "Laptop asset charge",
      amount: 250,
      status: "PENDING",
      employeeId: priya.id,
      employeeName: priya.fullName,
      assetTag: "LAP-001",
      notes: "Demo outstanding asset charge",
    },
  });

  console.log("Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
