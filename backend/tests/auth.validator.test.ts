import { loginSchema, registerSchema } from "../src/validators/auth.validator";

describe("Authentication Validator Unit Tests", () => {
  describe("Login Schema", () => {
    it("should pass with valid email and password", () => {
      const payload = {
        email: "test@example.com",
        password: "Password123",
      };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should fail with invalid email format", () => {
      const payload = {
        email: "not-an-email",
        password: "Password123",
      };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid email format");
      }
    });

    it("should fail with empty password", () => {
      const payload = {
        email: "test@example.com",
        password: "",
      };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Password is required");
      }
    });
  });

  describe("Register Schema", () => {
    it("should fail validation if password lacks numbers", () => {
      const payload = {
        email: "employee@assetflow.com",
        password: "NoNumbersPassword",
        fullName: "Jane Doe",
        employeeCode: "EMP-1002",
        roleId: "80db9a6a-d2d0-406a-a551-f7614d9b7364",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Password must contain at least one number");
      }
    });

    it("should pass validation with fully compliant fields", () => {
      const payload = {
        email: "employee@assetflow.com",
        password: "Secure123Password",
        fullName: "Jane Doe",
        employeeCode: "EMP-1002",
        roleId: "80db9a6a-d2d0-406a-a551-f7614d9b7364",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
