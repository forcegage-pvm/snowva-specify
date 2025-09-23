// packages/web/src/services/EmailService.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  // Configure your email transport here
  // For example, using a service like SendGrid or an SMTP server
  // This is a mock transport
  streamTransport: true,
  newline: 'unix',
  buffer: true,
});

export const EmailService = {
  async sendQuote(to: string, pdf: Buffer): Promise<void> {
    await transporter.sendMail({
      from: 'noreply@snowva.com',
      to,
      subject: 'Your Quote from Snowva',
      text: 'Please find your quote attached.',
      attachments: [
        {
          filename: 'quote.pdf',
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    });
  },
};
