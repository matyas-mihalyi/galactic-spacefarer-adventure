jest.mock("@sap/cds", () => ({
  log: jest.fn(() => ({
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));
import nodemailer from "nodemailer";
import { EmailService } from "../../srv/services/email.service";
import { SendMailOptions } from "nodemailer";

jest.mock("nodemailer");

const sendMailMock = jest.fn();

(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock,
});

describe("EmailService Singleton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create only one instance", () => {
    const instance1 = EmailService.getInstance();
    const instance2 = EmailService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should send an email", async () => {
    sendMailMock.mockResolvedValue({ messageId: "test-id" });

    const emailService = EmailService.getInstance();

    const mailOptions: SendMailOptions = {
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Subject",
      text: "Test message",
    };

    await expect(emailService.send(mailOptions)).resolves.not.toThrow();
    expect(sendMailMock).toHaveBeenCalledWith(mailOptions);
  });

  it("should throw an error if sending fails", async () => {
    const error = new Error("SMTP Error");
    sendMailMock.mockRejectedValue(error);

    const emailService = EmailService.getInstance();

    const mailOptions: SendMailOptions = {
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Subject",
      text: "Test message",
    };

    await expect(emailService.send(mailOptions)).rejects.toThrow(
      "Email sending failed",
    );
  });
});
