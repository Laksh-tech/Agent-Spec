import nodemailer from "nodemailer";
import { logger } from "./logger";

export const OWNER_EMAIL = "laksh.sk108@gmail.com";

const appPassword = (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s+/g, "");

let transporter: nodemailer.Transporter | null = null;

export function isMailerConfigured(): boolean {
  return appPassword.length > 0;
}

function getTransporter(): nodemailer.Transporter | null {
  if (!isMailerConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: OWNER_EMAIL,
        pass: appPassword,
      },
    });
  }
  return transporter;
}

export interface VisitorMessage {
  name: string;
  email: string | null | undefined;
  body: string;
}

export async function sendVisitorMessage(msg: VisitorMessage): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    logger.warn("Mailer not configured (missing GMAIL_APP_PASSWORD); skipping send.");
    return false;
  }
  try {
    const subject = `[CLI portfolio] message from ${msg.name}`;
    const replyTo = msg.email ?? undefined;
    const text = [
      `New message from your terminal portfolio.`,
      ``,
      `From : ${msg.name}`,
      `Email: ${msg.email ?? "(not provided)"}`,
      `Time : ${new Date().toISOString()}`,
      ``,
      `------------------------------------------------------------`,
      msg.body,
      `------------------------------------------------------------`,
    ].join("\n");
    await t.sendMail({
      from: `"CLI Portfolio" <${OWNER_EMAIL}>`,
      to: OWNER_EMAIL,
      replyTo,
      subject,
      text,
    });
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send visitor message email");
    return false;
  }
}
