import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';
import nodemailer from 'nodemailer';

export class LinkBuildingService {
  constructor() {
    this.mailer = null;
    this.initializeMailer();
  }

  async initializeMailer() {
    try {
      this.mailer = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } catch (error) {
      logger.error('Fout bij het initialiseren van de mailer:', error);
    }
  }

  async analyzeBacklinks(url) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      const backlinks = [];
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('http')) {
          backlinks.push({
            url: href,
            anchor: $(element).text().trim(),
            nofollow: $(element).attr('rel')?.includes('nofollow') || false
          });
        }
      });

      return backlinks;
    } catch (error) {
      logger.error('Backlink analysis failed:', error);
      throw error;
    }
  }

  async sendOutreachEmail(contact, template) {
    try {
      if (!this.mailer) {
        await this.initializeMailer();
      }

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: contact.email,
        subject: template.subject,
        html: this.personalizeTemplate(template.body, contact)
      };

      const result = await this.mailer.sendMail(mailOptions);
      logger.info(`Outreach email sent to ${contact.email}`);
      return result;
    } catch (error) {
      logger.error('Outreach email failed:', error);
      throw error;
    }
  }

  personalizeTemplate(template, contact) {
    return template
      .replace('{{name}}', contact.name)
      .replace('{{website}}', contact.website)
      .replace('{{company}}', contact.company);
  }
}