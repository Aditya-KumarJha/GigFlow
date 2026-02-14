import nodemailer from "nodemailer";
import { google } from "googleapis";
import { logger } from "../utils/logger.js";

const OAuth2 = google.auth.OAuth2;

let transporter = null;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

if (
  !process.env.EMAIL_USER ||
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.REFRESH_TOKEN
) {
  logger.warn("⚠️ Missing OAuth2 env variables");
  logger.warn(
    "Required: EMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REFRESH_TOKEN"
  );
} else {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: async () => {
        const accessTokenResponse = await oauth2Client.getAccessToken();
        return accessTokenResponse?.token || accessTokenResponse;
      },
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });

  transporter.verify((error) => {
    if (error) {
      logger.error("❌ Error connecting to email server:", error?.message || error);
    } else {
      logger.info("✅ Email server is ready to send messages");
    }
  });
}

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!transporter) {
      logger.warn("⚠️ Email not configured; skipping send");
      return null;
    }

    const noRecipients =
      !to ||
      (Array.isArray(to) && to.length === 0) ||
      (typeof to === "string" && to.trim() === "");

    if (noRecipients) {
      logger.warn(
        `⚠️ sendEmail: no recipients provided — skipping email (subject: ${subject})`
      );
      return null;
    }

    const info = await transporter.sendMail({
      from: `"GigFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html,
      html: html || text,
    });

    logger.info("✅ Message sent:", info.messageId);
    return info;
  } catch (error) {
    logger.error("❌ Error sending email:", error?.message || error);
    return null;
  }
};

export default sendEmail;
