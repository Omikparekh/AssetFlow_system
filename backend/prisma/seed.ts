import prisma, { pool } from "../src/config/database";
import { UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding database...");

  // 1. Create permissions
  const permissions = [
    { name: "ViewDepartments", description: "Allows viewing department hierarchy" },
    { name: "ManageDepartments", description: "Allows creating, editing, and deleting departments" },
    { name: "ViewEmployees", description: "Allows viewing employee list" },
    { name: "ManageEmployees", description: "Allows editing employee roles and statuses" },
    { name: "ManageOrganization", description: "Allows managing global organization settings" }
  ];

  console.log("Creating permissions...");
  const createdPermissions = [];
  for (const perm of permissions) {
    const dbPerm = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm
    });
    createdPermissions.push(dbPerm);
  }

  // 2. Create roles
  console.log("Creating roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "System administrator with full privileges"
    }
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: "Employee" },
    update: {},
    create: {
      name: "Employee",
      description: "Standard company employee"
    }
  });

  // 3. Link permissions to roles (Admin gets all permissions)
  console.log("Linking permissions to Admin role...");
  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id
      }
    });
  }

  // Employee gets View permissions
  console.log("Linking permissions to Employee role...");
  const employeePerms = createdPermissions.filter(p => 
    p.name === "ViewDepartments" || p.name === "ViewEmployees"
  );
  for (const perm of employeePerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: employeeRole.id,
          permissionId: perm.id
        }
      },
      update: {},
      create: {
        roleId: employeeRole.id,
        permissionId: perm.id
      }
    });
  }

  // 4. Create default department
  console.log("Creating default department...");
  const defaultDept = await prisma.department.upsert({
    where: { departmentCode: "HQ" },
    update: {},
    create: {
      name: "Head Office",
      departmentCode: "HQ",
      description: "Company Headquarters",
      status: UserStatus.ACTIVE
    }
  });

  // 5. Create default Admin User
  console.log("Creating default Admin user...");
  const adminEmail = "admin@assetflow.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: "System Administrator",
        employeeCode: "EMP-001",
        status: UserStatus.ACTIVE,
        roleId: adminRole.id,
        departmentId: defaultDept.id,
      }
    });
    console.log("Default Admin user created successfully:");
    console.log(`  Email: ${adminEmail}`);
    console.log("  Password: admin123");
  } else {
    console.log("Admin user already exists.");
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
