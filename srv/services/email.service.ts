import nodemailer, { Transporter, SendMailOptions } from "nodemailer";

export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async send(mailOptions: SendMailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Email sending failed");
    }
  }
}
