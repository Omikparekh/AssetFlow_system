import nodemailer from "nodemailer";
import logger from "../utils/logger";

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class MailerService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // True for 465, false for others
        auth: { user, pass },
      });
      this.isConfigured = true;
      logger.info(`SMTP Mailer initialized pointing to host: ${host}`);
    } else {
      logger.info("SMTP configuration incomplete. Mailer running in standard console mock logging mode.");
    }
  }

  async sendMail(options: MailOptions): Promise<void> {
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
        logger.info(`Email successfully dispatched: id=${info.messageId}, recipient=${options.to}`);
        return;
      } catch (err) {
        logger.error(err, `SMTP dispatch failed to: ${options.to}`);
      }
    }

    // Mock logger output
    logger.info(`
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

export const mailer = new MailerService();
