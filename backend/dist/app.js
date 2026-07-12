"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const organization_routes_1 = __importDefault(require("./routes/organization.routes"));
const department_routes_1 = __importDefault(require("./routes/department.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const asset_routes_1 = __importDefault(require("./routes/asset.routes"));
const allocation_routes_1 = __importDefault(require("./routes/allocation.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const maintenance_routes_1 = __importDefault(require("./routes/maintenance.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// 1. Security Header Protection
app.use((0, helmet_1.default)());
// 2. Cross-Origin Resource Sharing (CORS)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:5173"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Blocked by CORS security policy"));
        }
    },
    credentials: true,
}));
// 3. Compression for response payloads
app.use((0, compression_1.default)());
// 4. Body & Cookie Parsing
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
// 5. Global Rate Limiter
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api/", globalLimiter);
// 6. Routes Mapping
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/organization", organization_routes_1.default);
app.use("/api/v1/departments", department_routes_1.default);
app.use("/api/v1/employees", employee_routes_1.default);
app.use("/api/v1/assets", asset_routes_1.default);
app.use("/api/v1/allocations", allocation_routes_1.default);
app.use("/api/v1/notifications", notification_routes_1.default);
app.use("/api/v1/maintenance", maintenance_routes_1.default);
app.use("/api/v1/dashboard", dashboard_routes_1.default);
app.use("/api/v1/bookings", booking_routes_1.default);
// 7. Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", timestamp: new Date() });
});
// 8. Global Error Handler Middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
