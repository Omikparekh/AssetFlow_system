"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.updateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Organization name must be at least 2 characters"),
    taxId: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().email("Invalid email format").optional().nullable(),
    website: zod_1.z.string().url("Invalid website URL").optional().nullable(),
    currency: zod_1.z.string().min(1, "Currency is required").default("USD"),
});
