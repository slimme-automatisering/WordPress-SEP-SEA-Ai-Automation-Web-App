import nodemailer from "nodemailer";
import logger from "../utils/logger.js";
import AppError from "../utils/errorHandler.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOutreachEmail(template, recipient, data) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: recipient,
        subject: template.subject,
        html: this.compileTemplate(template.body, data),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email verzonden: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error("Email sending error:", error);
      throw new AppError("Email verzenden mislukt", 500);
    }
  }

  compileTemplate(template, data) {
    return template.replace(/\${(\w+)}/g, (match, key) => data[key] || "");
  }
}

export default new EmailService();
