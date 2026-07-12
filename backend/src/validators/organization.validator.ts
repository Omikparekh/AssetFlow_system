import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  taxId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email format").optional().nullable(),
  website: z.string().url("Invalid website URL").optional().nullable(),
  currency: z.string().min(1, "Currency is required").default("USD"),
});
