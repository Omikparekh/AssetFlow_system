export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public message: string) {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class UnauthorizedError extends CustomError {
  statusCode = 401;

  constructor(public message: string = "Not Authorized") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ForbiddenError extends CustomError {
  statusCode = 403;

  constructor(public message: string = "Forbidden") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(public message: string = "Resource Not Found") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ConflictError extends CustomError {
  statusCode = 409;

  constructor(public message: string) {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: { message: string; field?: string }[]) {
    super("Validation failed");
  }

  serializeErrors() {
    return this.errors;
  }
}

export class InternalServerError extends CustomError {
  statusCode = 500;

  constructor(public message: string = "Internal Server Error") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
