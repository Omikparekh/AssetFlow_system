"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFailure = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200, meta) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        meta,
    });
};
exports.sendSuccess = sendSuccess;
const sendFailure = (res, message, statusCode = 400, errors = []) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
exports.sendFailure = sendFailure;
