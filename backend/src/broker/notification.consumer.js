import { subscribeToQueue } from "./broker.js";
import { sendEmail } from "../services/email.service.js";

const getCustomerName = (data = {}) => {
  if (data.fullName && typeof data.fullName === "object") {
    const first = data.fullName.firstName || "";
    const last = data.fullName.lastName || "";
    const name = `${first} ${last}`.trim();
    if (name) return name;
  }
  if (typeof data.fullName === "string" && data.fullName.trim()) {
    return data.fullName;
  }
  if (data.username && data.username.trim()) {
    return data.username;
  }
  return "there";
};

const emailLayout = ({ title, body }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
    <h2 style="color: #2c3e50;">${title}</h2>
    ${body}
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
    <p style="font-size: 12px; color: #888;">
      This is an automated email from GigFlow. Please do not share OTPs or sensitive information.
    </p>
  </div>
`;

const otpBlock = (otp, color = "#3498db") => `
  <div style="font-size: 26px; font-weight: bold; color: ${color}; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px; margin: 20px 0;">
    ${otp}
  </div>
`;

const footerSignature = `
  <p style="margin-top: 30px;">
    Best regards,<br/>
    <strong>The GigFlow Team</strong>
  </p>
`;


export const startNotificationConsumers = async () => {

  subscribeToQueue("AUTH_NOTIFICATION.REGISTER_OTP", async (data) => {
    const name = getCustomerName(data);

    const html = emailLayout({
      title: "Welcome to GigFlow 🚀",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for registering on GigFlow. To complete your registration, please verify your email address using the OTP below.</p>
        ${otpBlock(data.otpCode)}
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not create this account, please ignore this email.</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.email,
        subject: "Verify your email – GigFlow",
        text: `Your OTP is ${data.otpCode}. It expires in 10 minutes.`,
        html,
      });
    } catch (error) {
      console.error('Failed to send registration OTP email:', error);
    }
  });

  subscribeToQueue("AUTH_NOTIFICATION.RESEND_OTP", async (data) => {
    const name = getCustomerName(data);

    const html = emailLayout({
      title: "Your New OTP – GigFlow",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>You requested a new OTP to verify your account. Please use the OTP below:</p>
        ${otpBlock(data.otpCode)}
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this OTP, please secure your account immediately.</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.email,
        subject: "Your new OTP – GigFlow",
        text: `Your new OTP is ${data.otpCode}.`,
        html,
      });
    } catch (error) {
      console.error('Failed to send resend OTP email:', error);
    }
  });

  subscribeToQueue("AUTH_NOTIFICATION.LOGIN_OTP", async (data) => {
    const name = getCustomerName(data);

    const html = emailLayout({
      title: "Login Verification – GigFlow 🔐",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>We detected a login attempt on your GigFlow account. If this was you, please verify using the OTP below:</p>
        ${otpBlock(data.otpCode)}
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p><strong>⚠️ If this wasn’t you</strong>, we strongly recommend changing your password immediately.</p>
        ${footerSignature}
      `,
    });

    await sendEmail({
      to: data.email,
      subject: "Login OTP – GigFlow",
      text: `Your login OTP is ${data.otpCode}.`,
      html,
    });
  });

  subscribeToQueue("AUTH_NOTIFICATION.FORGOT_PASSWORD_OTP", async (data) => {
    const name = getCustomerName(data);

    const html = emailLayout({
      title: "Reset Your Password – GigFlow 🔑",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your GigFlow account password.</p>
        <p>Please use the OTP below to proceed:</p>
        ${otpBlock(data.otpCode, "#e74c3c")}
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p><strong>⚠️ If you did not request a password reset</strong>, please ignore this email.</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.email,
        subject: "Reset your password – GigFlow",
        text: `Your password reset OTP is ${data.otpCode}.`,
        html,
      });
    } catch (error) {
      console.error('Failed to send forgot password OTP email:', error);
    }
  });

  subscribeToQueue("AUTH_NOTIFICATION.WELCOME_USER", async (data) => {
    const name = getCustomerName(data);

    const html = emailLayout({
      title: "Welcome to GigFlow! 🎉",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your email has been successfully verified and your GigFlow account is now active.</p>
        <p>You can now:</p>
        <ul>
          <li>Create and manage gigs</li>
          <li>Browse freelance opportunities</li>
          <li>Connect securely with professionals</li>
        </ul>
        <p>We’re excited to have you onboard!</p>
        ${footerSignature}
      `,
    });

    await sendEmail({
      to: data.email,
      subject: "Welcome to GigFlow! 🎉",
      text: "Your GigFlow account is now active.",
      html,
    });
  });

  subscribeToQueue("AUTH_NOTIFICATION.LOGIN_SUCCESS", async (data) => {
    const name = getCustomerName(data);

    const html = emailLayout({
      title: "Successful Login – GigFlow ✅",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>You have successfully logged in to your GigFlow account.</p>
        <p>If this was not you, please change your password immediately.</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.email,
        subject: "Successful Login – GigFlow",
        text: "You have successfully logged in to your GigFlow account.",
        html,
      });
    } catch (error) {
      console.error('Failed to send login success email:', error);
    }
  });

  subscribeToQueue("AUTH_NOTIFICATION.PASSWORD_UPDATED", async (data) => {
    const name = getCustomerName(data);

    const html = emailLayout({
      title: "Password Updated – GigFlow 🔒",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your GigFlow account password has been successfully updated.</p>
        <p>If you did not perform this action, please contact support immediately.</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.email,
        subject: "Password Updated – GigFlow",
        text: "Your password has been updated successfully.",
        html,
      });
    } catch (error) {
      console.error('Failed to send password updated email:', error);
    }
  });

  subscribeToQueue("GIG_NOTIFICATION.CREATED", async (data) => {
    const name = getCustomerName(data.owner);

    const html = emailLayout({
      title: "Your Gig Has Been Created ✅",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your gig has been successfully published on GigFlow.</p>
        <p><strong>Title:</strong> ${data.gig.title}</p>
        <p><strong>Budget:</strong> ₹${data.gig.budget}</p>
        <p>Freelancers can now start bidding on your gig.</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.owner.email,
        subject: "Gig created – GigFlow",
        text: `Your gig "${data.gig.title}" has been created.`,
        html,
      });
    } catch (error) {
      console.error('Failed to send gig created email:', error);
    }
  });

  subscribeToQueue("GIG_NOTIFICATION.UPDATED", async (data) => {
    const name = getCustomerName(data.owner);

    const html = emailLayout({
      title: "Your Gig Was Updated ✏️",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your gig details were updated successfully.</p>
        <p><strong>Title:</strong> ${data.gig.title}</p>
        <p><strong>Budget:</strong> ₹${data.gig.budget}</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.owner.email,
        subject: "Gig updated – GigFlow",
        text: `Your gig "${data.gig.title}" was updated.`,
        html,
      });
    } catch (error) {
      console.error('Failed to send gig updated email:', error);
    }
  });

  subscribeToQueue("GIG_NOTIFICATION.DELETED", async (data) => {
    const name = getCustomerName(data.owner);

    const html = emailLayout({
      title: "Gig Deleted 🗑️",
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your gig titled <strong>${data.gig.title}</strong> has been deleted.</p>
        <p>If this was not initiated by you, please contact support immediately.</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.owner.email,
        subject: "Gig deleted – GigFlow",
        text: `Your gig "${data.gig.title}" was deleted.`,
        html,
      });
    } catch (error) {
      console.error('Failed to send gig deleted email:', error);
    }
  });

  subscribeToQueue("BID_NOTIFICATION.CREATED", async (data) => {
    const freelancerName = getCustomerName(data.freelancer);
    const clientName = getCustomerName(data.gigOwner);

    const html = emailLayout({
      title: "New Bid Received! 💼",
      body: `
        <p>Hi <strong>${clientName}</strong>,</p>
        <p>You have received a new bid on your gig <strong>"${data.gig.title}"</strong>.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Freelancer:</strong> ${freelancerName}</p>
          <p style="margin: 5px 0;"><strong>Bid Amount:</strong> ₹${data.bid.price}</p>
          <p style="margin: 5px 0;"><strong>Message:</strong></p>
          <p style="margin: 5px 0; font-style: italic;">${data.bid.message}</p>
        </div>
        <p>Log in to GigFlow to review and accept bids.</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.gigOwner.email,
        subject: `New bid on "${data.gig.title}" – GigFlow`,
        text: `${freelancerName} submitted a bid of ₹${data.bid.price} on your gig "${data.gig.title}".`,
        html,
      });
    } catch (error) {
      console.error('Failed to send bid created email:', error);
    }
  });

  subscribeToQueue("BID_NOTIFICATION.HIRED", async (data) => {
    const freelancerName = getCustomerName(data.freelancer);
    const clientName = getCustomerName(data.client);

    const freelancerHtml = emailLayout({
      title: "🎉 Congratulations! You've Been Hired!",
      body: `
        <p>Hi <strong>${freelancerName}</strong>,</p>
        <p>Great news! <strong>${clientName}</strong> has accepted your bid and hired you for the gig:</p>
        <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 5px 0;"><strong>Gig:</strong> ${data.gig.title}</p>
          <p style="margin: 5px 0;"><strong>Budget:</strong> ₹${data.gig.budget}</p>
          <p style="margin: 5px 0;"><strong>Your Bid:</strong> ₹${data.bid.price}</p>
        </div>
        <p>Log in to GigFlow to start working on this project!</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.freelancer.email,
        subject: `🎉 You've been hired for "${data.gig.title}" – GigFlow`,
        text: `Congratulations! ${clientName} has hired you for "${data.gig.title}".`,
        html: freelancerHtml,
      });
    } catch (error) {
      console.error('Failed to send hired notification to freelancer:', error);
    }

    const clientHtml = emailLayout({
      title: "Freelancer Hired Successfully ✅",
      body: `
        <p>Hi <strong>${clientName}</strong>,</p>
        <p>You have successfully hired <strong>${freelancerName}</strong> for your gig:</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Gig:</strong> ${data.gig.title}</p>
          <p style="margin: 5px 0;"><strong>Freelancer:</strong> ${freelancerName}</p>
          <p style="margin: 5px 0;"><strong>Agreed Price:</strong> ₹${data.bid.price}</p>
        </div>
        ${data.rejectedBidsCount > 0 ? `<p><em>${data.rejectedBidsCount} other bid(s) have been automatically rejected.</em></p>` : ''}
        <p>You can now coordinate with the freelancer to begin work.</p>
        ${footerSignature}
      `,
    });

    try {
      await sendEmail({
        to: data.client.email,
        subject: `Freelancer hired for "${data.gig.title}" – GigFlow`,
        text: `You have hired ${freelancerName} for "${data.gig.title}".`,
        html: clientHtml,
      });
    } catch (error) {
      console.error('Failed to send hire confirmation to client:', error);
    }

    if (Array.isArray(data.rejectedBidders) && data.rejectedBidders.length > 0) {
      for (const rb of data.rejectedBidders) {
        const bidder = rb.freelancer || {};
        const bidderName = getCustomerName(bidder);

        const rejectHtml = emailLayout({
          title: "Update on your bid – GigFlow",
          body: `
            <p>Hi <strong>${bidderName}</strong>,</p>
            <p>Thank you for submitting a bid for the gig <strong>"${data.gig.title}"</strong>.</p>
            <p>We appreciate your effort, but this time the client selected another freelancer.</p>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 5px; margin: 12px 0;">
              <p style="margin: 5px 0;"><strong>Your Bid:</strong> ₹${rb.price}</p>
            </div>
            <p>Thanks for trying — keep applying to other gigs. Good luck!</p>
            ${footerSignature}
          `,
        });

        try {
          if (bidder.email) {
            await sendEmail({
              to: bidder.email,
              subject: `Update on your bid for "${data.gig.title}" – GigFlow`,
              text: `Thanks for bidding on "${data.gig.title}". Your bid of $${rb.price} was not selected.`,
              html: rejectHtml,
            });
          }
        } catch (err) {
          console.error(`Failed to send rejection email to ${bidder.email}:`, err);
        }
      }
    }
  });

  subscribeToQueue("BID_NOTIFICATION.UPDATED", async (data) => {
    const freelancerName = getCustomerName(data.freelancer);
    const gigTitle = data.gig?.title || "your gig";

    const freelancerHtml = emailLayout({
      title: "Your bid was updated ✏️",
      body: `
        <p>Hi <strong>${freelancerName}</strong>,</p>
        <p>Your bid for <strong>"${gigTitle}"</strong> was updated successfully.</p>
        <div style="background: #f8f9fa; padding: 12px; border-radius: 5px; margin: 12px 0;">
          <p style="margin: 5px 0;"><strong>New Bid:</strong> ₹${data.bid?.price ?? "-"}</p>
          <p style="margin: 5px 0;"><strong>Message:</strong></p>
          <p style="margin: 5px 0; font-style: italic;">${data.bid?.message ?? "(no message)"}</p>
        </div>
        <p>You can view or manage your bids on GigFlow.</p>
        ${footerSignature}
      `,
    });

    try {
      if (data.freelancer?.email) {
        await sendEmail({
          to: data.freelancer.email,
          subject: `Your bid for "${gigTitle}" was updated – GigFlow`,
          text: `Your bid was updated. New price: ₹${data.bid?.price ?? "-"}`,
          html: freelancerHtml,
        });
      }
    } catch (err) {
      console.error('Failed to send bid updated email to freelancer:', err);
    }

    if (data.gigOwner && data.gigOwner.email) {
      const ownerName = getCustomerName(data.gigOwner);
      const ownerHtml = emailLayout({
        title: "A bid was updated on your gig 🔔",
        body: `
          <p>Hi <strong>${ownerName}</strong>,</p>
          <p>A bid on your gig <strong>"${gigTitle}"</strong> was updated by <strong>${freelancerName}</strong>.</p>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 5px; margin: 12px 0;">
            <p style="margin: 5px 0;"><strong>Updated Bid:</strong> ₹${data.bid?.price ?? "-"}</p>
            <p style="margin: 5px 0;"><strong>Message:</strong></p>
            <p style="margin: 5px 0; font-style: italic;">${data.bid?.message ?? "(no message)"}</p>
          </div>
          <p>Log in to GigFlow to review the updated bid.</p>
          ${footerSignature}
        `,
      });

      try {
        await sendEmail({
          to: data.gigOwner.email,
          subject: `A bid on "${gigTitle}" was updated – GigFlow`,
          text: `${freelancerName} updated their bid on "${gigTitle}".`,
          html: ownerHtml,
        });
      } catch (err) {
        console.error('Failed to send bid updated email to gig owner:', err);
      }
    }

  });

  subscribeToQueue("BID_NOTIFICATION.DELETED", async (data) => {
    const freelancerName = getCustomerName(data.freelancer);
    const gigTitle = data.gig?.title || "the gig";

    const freelancerHtml = emailLayout({
      title: "Your bid was withdrawn 🗑️",
      body: `
        <p>Hi <strong>${freelancerName}</strong>,</p>
        <p>Your bid for <strong>"${gigTitle}"</strong> has been deleted successfully.</p>
        <p>If this was a mistake, you may submit a new bid if the gig is still open.</p>
        ${footerSignature}
      `,
    });

    try {
      if (data.freelancer?.email) {
        await sendEmail({
          to: data.freelancer.email,
          subject: `Your bid on "${gigTitle}" was deleted – GigFlow`,
          text: `Your bid on "${gigTitle}" was deleted.`,
          html: freelancerHtml,
        });
      }
    } catch (err) {
      console.error('Failed to send bid deleted email to freelancer:', err);
    }

    if (data.gigOwner && data.gigOwner.email) {
      const ownerName = getCustomerName(data.gigOwner);
      const ownerHtml = emailLayout({
        title: "A bid was withdrawn from your gig ⚠️",
        body: `
          <p>Hi <strong>${ownerName}</strong>,</p>
          <p><strong>${freelancerName}</strong> has withdrawn their bid from your gig <strong>"${gigTitle}"</strong>.</p>
          <p>Log in to GigFlow to see other bids or to reopen the gig for more applications.</p>
          ${footerSignature}
        `,
      });

      try {
        await sendEmail({
          to: data.gigOwner.email,
          subject: `A bid was withdrawn from "${gigTitle}" – GigFlow`,
          text: `${freelancerName} withdrew their bid from "${gigTitle}".`,
          html: ownerHtml,
        });
      } catch (err) {
        console.error('Failed to send bid deleted email to gig owner:', err);
      }
    }

  });

  console.log("✅ All notification consumers started");
};
