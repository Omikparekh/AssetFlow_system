"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const custom_error_1 = require("../errors/custom.error");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const client_1 = require("@prisma/client");
const errorHandler = (err, req, res, next) => {
    // Log the complete stack trace of the error
    logger_1.default.error(err, `Error caught in request: ${req.method} ${req.url}`);
    // 1. Handled custom application errors
    if (err instanceof custom_error_1.CustomError) {
        (0, response_1.sendFailure)(res, err.message, err.statusCode, err.serializeErrors());
        return;
    }
    // 2. Prisma Database Errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Handling Unique constraint violations (P2002)
        if (err.code === "P2002") {
            const targets = err.meta?.target || [];
            const fields = targets.join(", ");
            (0, response_1.sendFailure)(res, `Duplicate field value: ${fields}`, 409, [
                { message: `Value already exists for fields: ${fields}`, field: targets[0] },
            ]);
            return;
        }
        // Handling Foreign key violations (P2003)
        if (err.code === "P2003") {
            (0, response_1.sendFailure)(res, "Referential integrity constraint failed.", 400, [
                { message: "A referenced record could not be found or delete was restricted." },
            ]);
            return;
        }
        // Handling Record not found (P2025)
        if (err.code === "P2025") {
            (0, response_1.sendFailure)(res, "Requested record not found.", 404, [
                { message: err.message || "Record not found" },
            ]);
            return;
        }
    }
    // 3. JsonWebToken Errors
    if (err.name === "TokenExpiredError") {
        (0, response_1.sendFailure)(res, "Authentication token has expired", 401, [
            { message: "Token expired" },
        ]);
        return;
    }
    if (err.name === "JsonWebTokenError") {
        (0, response_1.sendFailure)(res, "Invalid authentication token signature", 401, [
            { message: "Invalid token" },
        ]);
        return;
    }
    // 4. Default unhandled server errors (500)
    const isProduction = process.env.NODE_ENV === "production";
    const errorMessage = isProduction ? "Internal Server Error" : err.message;
    (0, response_1.sendFailure)(res, errorMessage, 500, [
        { message: isProduction ? "Something went wrong on our end" : err.stack || err.message },
    ]);
};
exports.errorHandler = errorHandler;
