"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = exports.BookingController = void 0;
const database_1 = __importDefault(require("../config/database"));
const response_1 = require("../utils/response");
class BookingController {
    async availability(req, res, next) {
        try {
            const { assetId, date } = req.query;
            if (!assetId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
                res.status(400).json({ success: false, message: "An asset and booking date are required" });
                return;
            }
            const dayStart = new Date(`${date}T00:00:00`);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            const resource = await database_1.default.bookableResource.findUnique({ where: { assetId: String(assetId) } });
            if (!resource) {
                (0, response_1.sendSuccess)(res, "Booking availability fetched successfully", { unavailableHours: [] });
                return;
            }
            const bookings = await database_1.default.booking.findMany({
                where: {
                    resourceId: resource.id,
                    status: { in: ["UPCOMING", "ONGOING"] },
                    startTime: { lt: dayEnd },
                    endTime: { gt: dayStart },
                },
                select: { startTime: true, endTime: true },
            });
            const unavailableHours = Array.from({ length: 24 }, (_, hour) => {
                const slotStart = new Date(dayStart);
                slotStart.setHours(hour, 0, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setHours(slotEnd.getHours() + 1);
                return bookings.some((booking) => booking.startTime < slotEnd && booking.endTime > slotStart) ? hour : null;
            }).filter((hour) => hour !== null);
            (0, response_1.sendSuccess)(res, "Booking availability fetched successfully", { unavailableHours });
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const where = req.user.roleName === "Employee" ? { bookedById: req.user.id } : {};
            const bookings = await database_1.default.booking.findMany({
                where,
                include: { resource: { include: { asset: { include: { brand: true, model: true } } } } },
                orderBy: { startTime: "asc" },
            });
            (0, response_1.sendSuccess)(res, "Bookings fetched successfully", bookings);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            if (req.user.roleName !== "Employee") {
                res.status(403).json({ success: false, message: "Only employees can book assets" });
                return;
            }
            const { assetId, startTime, endTime, purpose } = req.body;
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (!assetId || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
                res.status(400).json({ success: false, message: "Provide an asset and a valid booking period" });
                return;
            }
            const asset = await database_1.default.asset.findFirst({ where: { id: assetId, deletedAt: null } });
            if (!asset || asset.currentStatus !== "AVAILABLE") {
                res.status(400).json({ success: false, message: "Only available assets can be booked" });
                return;
            }
            // Serializable isolation turns simultaneous overlapping requests into a
            // first-come, first-served operation: only the first committed booking wins.
            const booking = await database_1.default.$transaction(async (tx) => {
                const resource = await tx.bookableResource.upsert({
                    where: { assetId },
                    update: { isActive: true },
                    create: { assetId, name: asset.assetTag, location: asset.location, isActive: true, createdBy: req.user.id },
                });
                const conflict = await tx.booking.findFirst({
                    where: {
                        resourceId: resource.id,
                        status: { in: ["UPCOMING", "ONGOING"] },
                        startTime: { lt: end },
                        endTime: { gt: start },
                    },
                });
                if (conflict) {
                    const error = new Error("This asset is already booked during the selected period");
                    error.code = "BOOKING_CONFLICT";
                    throw error;
                }
                return tx.booking.create({
                    data: { resourceId: resource.id, bookedById: req.user.id, startTime: start, endTime: end, purpose, status: "UPCOMING", createdBy: req.user.id },
                });
            }, { isolationLevel: "Serializable" });
            (0, response_1.sendSuccess)(res, "Asset booked successfully", booking, 201);
        }
        catch (error) {
            const code = error?.code;
            if (code === "BOOKING_CONFLICT" || code === "P2034") {
                res.status(409).json({ success: false, message: "This asset was just booked for the selected time. Please choose another slot." });
                return;
            }
            next(error);
        }
    }
}
exports.BookingController = BookingController;
exports.bookingController = new BookingController();
