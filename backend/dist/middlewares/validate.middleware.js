"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const custom_error_1 = require("../errors/custom.error");
const validateRequest = (schemas) => {
    return async (req, res, next) => {
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
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const errorDetails = err.errors.map((e) => ({
                    message: e.message,
                    field: e.path.join("."),
                }));
                next(new custom_error_1.ValidationError(errorDetails));
                return;
            }
            next(err);
        }
    };
};
exports.validateRequest = validateRequest;
