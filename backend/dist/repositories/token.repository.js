"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRepository = exports.TokenRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class TokenRepository {
    async create(userId, token, expiresAt) {
        return database_1.default.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    }
    async findActive(token) {
        return database_1.default.refreshToken.findFirst({
            where: {
                token,
                isRevoked: false,
                expiresAt: { gt: new Date() },
            },
        });
    }
    async revoke(token) {
        return database_1.default.refreshToken.update({
            where: { token },
            data: { isRevoked: true },
        });
    }
    async revokeAllForUser(userId) {
        await database_1.default.refreshToken.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true },
        });
    }
}
exports.TokenRepository = TokenRepository;
exports.tokenRepository = new TokenRepository();
