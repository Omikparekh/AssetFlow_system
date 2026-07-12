import { createDepartmentSchema } from "../src/validators/department.validator";

describe("Department Validator Unit Tests", () => {
  it("should validate a correct department creation payload", () => {
    const payload = {
      name: "Engineering Department",
      departmentCode: "ENG-01",
      description: "Core engineering team",
    };
    const result = createDepartmentSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("should fail validation if name is too short", () => {
    const payload = {
      name: "E",
      departmentCode: "ENG-01",
    };
    const result = createDepartmentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Department name must be at least 2 characters");
    }
  });

  it("should fail validation if parentId is not a valid UUID", () => {
    const payload = {
      name: "Engineering Department",
      departmentCode: "ENG-01",
      parentId: "invalid-uuid",
    };
    const result = createDepartmentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Invalid Parent ID format");
    }
  });
});
