import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../errors/custom.error";

export const validateRequest = (schemas: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorDetails = err.errors.map((e) => ({
          message: e.message,
          field: e.path.join("."),
        }));
        next(new ValidationError(errorDetails));
        return;
      }
      next(err);
    }
  };
};
