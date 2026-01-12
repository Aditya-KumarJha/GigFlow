import { subscribeToQueue } from './broker.js';
import { sendEmail } from '../services/email.service.js';

const getCustomerName = (data) => {
  if (data.fullName && typeof data.fullName === 'object') {
    const first = data.fullName.firstName || '';
    const last = data.fullName.lastName || '';
    const name = `${first} ${last}`.trim();
    if (name.length > 0) return name;
  }
  if (typeof data.fullName === 'string' && data.fullName.trim().length > 0) {
    return data.fullName;
  }
  if (data.username && data.username.trim().length > 0) {
    return data.username;
  }
  return 'there';
};

export const startNotificationConsumers = async () => {
  subscribeToQueue('AUTH_NOTIFICATION.REGISTER_OTP', async (data) => {
    const customerName = getCustomerName(data);

    const emailHTMLTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #2c3e50;">Welcome to GigFlow 🚀</h2>
        
        <p>Hi <strong>${customerName}</strong>,</p>
        
        <p>
          Thank you for registering! To complete your registration, please verify your email address.
        </p>
        
        <p style="font-size: 24px; font-weight: bold; color: #3498db; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px;">
          ${data.otpCode}
        </p>
        
        <p>
          This OTP will expire in <strong>10 minutes</strong>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p>
          If you didn't create this account, please ignore this email.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br/>
          <strong>The GigFlow Team</strong>
        </p>
        
        <p style="font-size: 12px; color: #888;">
          This is an automated email for account verification.
        </p>
      </div>
    `;

    await sendEmail({
      to: data.email,
      subject: 'Verify your email – GigFlow',
      text: `Your OTP is ${data.otpCode}. It expires in 10 minutes.`,
      html: emailHTMLTemplate
    });

    console.log(`Registration OTP email sent to ${data.email}`);
  });

  subscribeToQueue('AUTH_NOTIFICATION.RESEND_OTP', async (data) => {
    const customerName = getCustomerName(data);

    const emailHTMLTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #2c3e50;">Your New OTP – GigFlow</h2>
        
        <p>Hi <strong>${customerName}</strong>,</p>
        
        <p>
          You requested a new OTP. Here it is:
        </p>
        
        <p style="font-size: 24px; font-weight: bold; color: #3498db; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px;">
          ${data.otpCode}
        </p>
        
        <p>
          This OTP will expire in <strong>10 minutes</strong>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p>
          If you didn't request this, please secure your account immediately.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br/>
          <strong>The GigFlow Team</strong>
        </p>
        
        <p style="font-size: 12px; color: #888;">
          This is an automated email for OTP verification.
        </p>
      </div>
    `;

    await sendEmail({
      to: data.email,
      subject: 'Your new OTP – GigFlow',
      text: `Your new OTP is ${data.otpCode}. It expires in 10 minutes.`,
      html: emailHTMLTemplate
    });

    console.log(`Resend OTP email sent to ${data.email}`);
  });

  subscribeToQueue('AUTH_NOTIFICATION.LOGIN_OTP', async (data) => {
    const customerName = getCustomerName(data);

    const emailHTMLTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #2c3e50;">Login Verification – GigFlow 🔐</h2>
        
        <p>Hi <strong>${customerName}</strong>,</p>
        
        <p>
          Someone is trying to log in to your GigFlow account. If this is you, use the OTP below:
        </p>
        
        <p style="font-size: 24px; font-weight: bold; color: #3498db; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px;">
          ${data.otpCode}
        </p>
        
        <p>
          This OTP will expire in <strong>10 minutes</strong>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p>
          <strong>⚠️ If you didn't attempt to log in</strong>, someone may be trying to access your account. 
          Please secure your account immediately.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br/>
          <strong>The GigFlow Team</strong>
        </p>
        
        <p style="font-size: 12px; color: #888;">
          This is an automated email for login verification.
        </p>
      </div>
    `;

    await sendEmail({
      to: data.email,
      subject: 'Login OTP – GigFlow',
      text: `Your login OTP is ${data.otpCode}. It expires in 10 minutes.`,
      html: emailHTMLTemplate
    });

    console.log(`Login OTP email sent to ${data.email}`);
  });

  subscribeToQueue('AUTH_NOTIFICATION.FORGOT_PASSWORD_OTP', async (data) => {
    const customerName = getCustomerName(data);

    const emailHTMLTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #2c3e50;">Reset Your Password – GigFlow 🔑</h2>
        
        <p>Hi <strong>${customerName}</strong>,</p>
        
        <p>
          We received a request to reset your password. Use the OTP below to proceed:
        </p>
        
        <p style="font-size: 24px; font-weight: bold; color: #e74c3c; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px;">
          ${data.otpCode}
        </p>
        
        <p>
          This OTP will expire in <strong>10 minutes</strong>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p>
          <strong>⚠️ If you didn't request a password reset</strong>, please ignore this email. 
          Your password will remain unchanged.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br/>
          <strong>The GigFlow Team</strong>
        </p>
        
        <p style="font-size: 12px; color: #888;">
          This is an automated email for password reset verification.
        </p>
      </div>
    `;

    await sendEmail({
      to: data.email,
      subject: 'Reset your password – GigFlow',
      text: `Your password reset OTP is ${data.otpCode}. It expires in 10 minutes.`,
      html: emailHTMLTemplate
    });

    console.log(`Forgot password OTP email sent to ${data.email}`);
  });

  // Welcome Email - After Successful Email Verification
  subscribeToQueue('AUTH_NOTIFICATION.WELCOME_USER', async (data) => {
    const customerName = getCustomerName(data);

    const emailHTMLTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #2c3e50;">Welcome to GigFlow! 🎉</h2>
        
        <p>Hi <strong>${customerName}</strong>,</p>
        
        <p>
          We're thrilled to have you onboard! Your GigFlow account has been successfully verified and is now ready to use.
        </p>
        
        <p>
          You can now explore the platform and start enjoying all our services. Whether you're looking to hire talented freelancers or offer your skills, GigFlow has got you covered.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">What's next?</h3>
          <ul style="line-height: 1.8;">
            <li>Complete your profile</li>
            <li>Browse available gigs</li>
            <li>Connect with professionals</li>
            <li>Start your journey with GigFlow</li>
          </ul>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p>
          If you ever need help, just reply to this email — we're here for you.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br/>
          <strong>The GigFlow Team</strong>
        </p>
        
        <p style="font-size: 12px; color: #888;">
          This is an automated email confirming your account registration.
        </p>
      </div>
    `;

    await sendEmail({
      to: data.email,
      subject: 'Welcome to GigFlow! 🎉',
      text: 'Your GigFlow account has been successfully verified. Start exploring!',
      html: emailHTMLTemplate
    });

    console.log(`Welcome email sent to ${data.email}`);
  });

  // Successful Login Notification
  subscribeToQueue('AUTH_NOTIFICATION.LOGIN_SUCCESS', async (data) => {
    const customerName = getCustomerName(data);

    const emailHTMLTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #2c3e50;">Successful Login to GigFlow ✅</h2>
        
        <p>Hi <strong>${customerName}</strong>,</p>
        
        <p>
          You have successfully logged in to your GigFlow account. Welcome back!
        </p>
        
        <p>
          Continue exploring opportunities and managing your gigs seamlessly.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p>
          <strong>⚠️ If you didn't log in</strong>, please secure your account immediately by changing your password.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br/>
          <strong>The GigFlow Team</strong>
        </p>
        
        <p style="font-size: 12px; color: #888;">
          This is an automated security notification.
        </p>
      </div>
    `;

    await sendEmail({
      to: data.email,
      subject: 'Successful Login – GigFlow',
      text: 'You have successfully logged in to your GigFlow account.',
      html: emailHTMLTemplate
    });

    console.log(`Login success email sent to ${data.email}`);
  });

  // Password Update Success
  subscribeToQueue('AUTH_NOTIFICATION.PASSWORD_UPDATED', async (data) => {
    const customerName = getCustomerName(data);

    const emailHTMLTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #2c3e50;">Password Successfully Updated 🔒</h2>
        
        <p>Hi <strong>${customerName}</strong>,</p>
        
        <p>
          Your GigFlow account password has been successfully updated.
        </p>
        
        <p>
          Your account is now secured with your new password. You can use it for future logins.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p>
          <strong>⚠️ If you didn't change your password</strong>, please contact us immediately. 
          Your account may be compromised.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br/>
          <strong>The GigFlow Team</strong>
        </p>
        
        <p style="font-size: 12px; color: #888;">
          This is an automated security notification.
        </p>
      </div>
    `;

    await sendEmail({
      to: data.email,
      subject: 'Password Updated – GigFlow',
      text: 'Your password has been successfully updated.',
      html: emailHTMLTemplate
    });

    console.log(`Password update email sent to ${data.email}`);
  });

  // OAuth Welcome Email (Google/GitHub)
  subscribeToQueue('AUTH_NOTIFICATION.OAUTH_WELCOME', async (data) => {
    const customerName = getCustomerName(data);
    const provider = data.provider ? data.provider.charAt(0).toUpperCase() + data.provider.slice(1) : 'OAuth';

    const emailHTMLTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #2c3e50;">Welcome to GigFlow! 🎉</h2>
        
        <p>Hi <strong>${customerName}</strong>,</p>
        
        <p>
          You've successfully signed in to GigFlow using your <strong>${provider}</strong> account. Welcome aboard!
        </p>
        
        <p>
          Your account is now ready to use. Explore the platform and start enjoying all our services.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">What's next?</h3>
          <ul style="line-height: 1.8;">
            <li>Complete your profile</li>
            <li>Browse available gigs</li>
            <li>Connect with professionals</li>
            <li>Start your journey with GigFlow</li>
          </ul>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p>
          If you ever need help, just reply to this email — we're here for you.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br/>
          <strong>The GigFlow Team</strong>
        </p>
        
        <p style="font-size: 12px; color: #888;">
          This is an automated email confirming your account registration via ${provider}.
        </p>
      </div>
    `;

    await sendEmail({
      to: data.email,
      subject: 'Welcome to GigFlow! 🎉',
      text: `Your GigFlow account has been successfully created via ${provider}.`,
      html: emailHTMLTemplate
    });

    console.log(`OAuth welcome email sent to ${data.email} (${provider})`);
  });

  console.log('✅ All notification consumers started');
};
