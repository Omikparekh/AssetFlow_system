"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
class MailerService {
    transporter = null;
    isConfigured = false;
    constructor() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT) || 587;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (host && user && pass) {
            this.transporter = nodemailer_1.default.createTransport({
                host,
                port,
                secure: port === 465, // True for 465, false for others
                auth: { user, pass },
            });
            this.isConfigured = true;
            logger_1.default.info(`SMTP Mailer initialized pointing to host: ${host}`);
        }
        else {
            logger_1.default.info("SMTP configuration incomplete. Mailer running in standard console mock logging mode.");
        }
    }
    async sendMail(options) {
        const sender = process.env.SMTP_FROM || "no-reply@assetflow.com";
        if (this.isConfigured && this.transporter) {
            try {
                const info = await this.transporter.sendMail({
                    from: sender,
                    to: options.to,
                    subject: options.subject,
                    text: options.text,
                    html: options.html,
                });
                logger_1.default.info(`Email successfully dispatched: id=${info.messageId}, recipient=${options.to}`);
                return;
            }
            catch (err) {
                logger_1.default.error(err, `SMTP dispatch failed to: ${options.to}`);
            }
        }
        // Mock logger output
        logger_1.default.info(`
========================================
[MOCK MAIL OUT]
From: ${sender}
To: ${options.to}
Subject: ${options.subject}
Body:
${options.text}
========================================
    `);
    }
}
exports.mailer = new MailerService();
