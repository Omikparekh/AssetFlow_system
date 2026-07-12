import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom.error";
import { sendFailure } from "../utils/response";
import logger from "../utils/logger";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the complete stack trace of the error
  logger.error(err, `Error caught in request: ${req.method} ${req.url}`);

  // 1. Handled custom application errors
  if (err instanceof CustomError) {
    sendFailure(res, err.message, err.statusCode, err.serializeErrors());
    return;
  }

  // 2. Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handling Unique constraint violations (P2002)
    if (err.code === "P2002") {
      const targets = (err.meta?.target as string[]) || [];
      const fields = targets.join(", ");
      sendFailure(res, `Duplicate field value: ${fields}`, 409, [
        { message: `Value already exists for fields: ${fields}`, field: targets[0] },
      ]);
      return;
    }
    
    // Handling Foreign key violations (P2003)
    if (err.code === "P2003") {
      sendFailure(res, "Referential integrity constraint failed.", 400, [
        { message: "A referenced record could not be found or delete was restricted." },
      ]);
      return;
    }

    // Handling Record not found (P2025)
    if (err.code === "P2025") {
      sendFailure(res, "Requested record not found.", 404, [
        { message: err.message || "Record not found" },
      ]);
      return;
    }
  }

  // 3. JsonWebToken Errors
  if (err.name === "TokenExpiredError") {
    sendFailure(res, "Authentication token has expired", 401, [
      { message: "Token expired" },
    ]);
    return;
  }
  if (err.name === "JsonWebTokenError") {
    sendFailure(res, "Invalid authentication token signature", 401, [
      { message: "Invalid token" },
    ]);
    return;
  }

  // 4. Default unhandled server errors (500)
  const isProduction = process.env.NODE_ENV === "production";
  const errorMessage = isProduction ? "Internal Server Error" : err.message;
  
  sendFailure(res, errorMessage, 500, [
    { message: isProduction ? "Something went wrong on our end" : err.stack || err.message },
  ]);
};
