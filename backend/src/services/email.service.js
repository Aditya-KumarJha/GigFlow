import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const noRecipients =
      !to ||
      (Array.isArray(to) && to.length === 0) ||
      (typeof to === "string" && to.trim() === "");

    if (noRecipients) {
      console.warn("sendEmail: no recipients provided — skipping email (subject:", subject, ")");
      return null;
    }

    const info = await transporter.sendMail({
      from: `"GigFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};
