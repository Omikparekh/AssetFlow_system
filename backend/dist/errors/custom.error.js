"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.CustomError = CustomError;
class BadRequestError extends CustomError {
    message;
    statusCode = 400;
    constructor(message) {
        super(message);
        this.message = message;
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends CustomError {
    message;
    statusCode = 401;
    constructor(message = "Not Authorized") {
        super(message);
        this.message = message;
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends CustomError {
    message;
    statusCode = 403;
    constructor(message = "Forbidden") {
        super(message);
        this.message = message;
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends CustomError {
    message;
    statusCode = 404;
    constructor(message = "Resource Not Found") {
        super(message);
        this.message = message;
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends CustomError {
    message;
    statusCode = 409;
    constructor(message) {
        super(message);
        this.message = message;
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends CustomError {
    errors;
    statusCode = 400;
    constructor(errors) {
        super("Validation failed");
        this.errors = errors;
    }
    serializeErrors() {
        return this.errors;
    }
}
exports.ValidationError = ValidationError;
class InternalServerError extends CustomError {
    message;
    statusCode = 500;
    constructor(message = "Internal Server Error") {
        super(message);
        this.message = message;
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
exports.InternalServerError = InternalServerError;
