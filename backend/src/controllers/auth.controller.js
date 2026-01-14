import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { generateOTP } from "../utils/generate.otp.js";
import { publishToQueue } from "../broker/broker.js";
import { uploadImage } from "../services/imagekit.service.js";

export const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      username,
      provider = "email",
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (provider === "email" && !password) {
      return res
        .status(400)
        .json({ message: "Password is required for email signup" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        if (!existingUser.otp || !existingUser.otp.expiresAt || existingUser.otp.expiresAt < new Date()) {
          await userModel.deleteOne({ _id: existingUser._id });
        } else {
          return res.status(409).json({ message: "User already exists with this email. Please verify your email or wait for OTP to expire." });
        }
      } else {
        return res.status(409).json({ message: "User already exists with this email" });
      }
    }

    let hashedPassword;
    if (provider === "email") {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const otpData = generateOTP();
    console.log("Generated OTP for signup:", otpData.code); 

    await userModel.create({
      email,
      password: hashedPassword,
      fullName,
      username,
      provider,
      otp: otpData,
      isVerified: false,
    });

    await publishToQueue('AUTH_NOTIFICATION.REGISTER_OTP', {
      email,
      fullName,
      username,
      otpCode: otpData.code,
    });

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Something went wrong during registration",
    });
  }
};

export const verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.provider && user.provider !== "email") {
      return res.status(400).json({
        message: `Account registered via ${user.provider}. OTP resend is not available for OAuth accounts. Please sign in using ${user.provider}.`,
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User is already verified",
      });
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.otp = undefined; 

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await publishToQueue('AUTH_NOTIFICATION.WELCOME_USER', {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
    });

    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      }
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      message: "Something went wrong while verifying OTP",
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email && !username) {
      return res.status(400).json({
        message: "Either email or username is required",
      });
    }

    let user = null;
    if (email) {
      user = await userModel.findOne({ email });
    }
    if (!user && username) {
      user = await userModel.findOne({ username });
    }
    console.debug('[resendOTP] lookup result:', !!user, user ? { id: user._id, email: user.email, provider: user.provider } : null);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User is already verified",
      });
    }

    const otpData = generateOTP();
    console.log("Resent OTP code:", otpData.code); 
    user.otp = otpData;
    await user.save();

    await publishToQueue('AUTH_NOTIFICATION.RESEND_OTP', {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      otpCode: otpData.code,
    });

    return res.status(200).json({
      message: "OTP resent successfully",
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      message: "Something went wrong while resending OTP",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        message: "Email or username and password are required",
      });
    }

    let user = null;
    if (email) {
      user = await userModel.findOne({ email }).select("+password");
    }
    if (!user && username) {
      user = await userModel.findOne({ username }).select("+password");
    }
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email or username",
      });
    }

    if (user.provider !== "email") {
      return res.status(400).json({
        message: `Please login using ${user.provider}`,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const otpData = generateOTP();
    console.log("Generated OTP for login:", otpData.code); 
    user.otp = otpData;
    await user.save();

    await publishToQueue('AUTH_NOTIFICATION.LOGIN_OTP', {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      otpCode: otpData.code,
    });

    return res.status(200).json({
      message: "OTP sent to your email. Please verify to complete login.",
    });

  } catch (error) {
    console.error("Login step-1 error:", error);
    return res.status(500).json({
      message: "Something went wrong during login",
    });
  }
};

export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, username, otp } = req.body;

    if ((!email && !username) || !otp) {
      return res.status(400).json({
        message: "Email or username and OTP are required",
      });
    }

    let user = null;
    if (email) {
      user = await userModel.findOne({ email });
    }
    if (!user && username) {
      user = await userModel.findOne({ username });
    }
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({
        message: "OTP not found. Please login again.",
      });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired. Please login again.",
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.otp = undefined;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    await publishToQueue('AUTH_NOTIFICATION.LOGIN_SUCCESS', {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      }
    });

  } catch (error) {
    console.error("Login OTP verify error:", error);
    return res.status(500).json({
      message: "Something went wrong while verifying login OTP",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email && !username) {
      return res.status(400).json({ message: "Either email or username is required" });
    }

    let user = null;
    if (email) {
      user = await userModel.findOne({ email });
    }
    if (!user && username) {
      user = await userModel.findOne({ username });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.provider && user.provider !== "email") {
      return res.status(400).json({ message: `Cannot reset password for accounts registered via ${user.provider}. Use ${user.provider} sign-in or contact support.` });
    }
    if (user.provider && user.provider !== "email") {
      return res.status(400).json({ message: `This account uses ${user.provider} sign-in. Password reset via OTP is not available.` });
    }
    if (user.provider && user.provider !== "email") {
      return res.status(400).json({ message: `Password reset not available for accounts registered via ${user.provider}. Use ${user.provider} sign-in or contact support.` });
    }
    const otpData = generateOTP();
    console.log("Generated OTP for forgot password:", otpData.code); 
    user.otp = otpData;
    await user.save();

    await publishToQueue('AUTH_NOTIFICATION.FORGOT_PASSWORD_OTP', {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      otpCode: otpData.code,
    });
    return res.status(200).json({
      message: "OTP sent to your email for password reset.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Something went wrong during forgot password" });
  }
};

export const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, username, otp } = req.body;
    console.debug('[verifyForgotPasswordOTP] request body:', { email, username, otpProvided: !!otp });
    if ((!email && !username) || !otp) {
      return res.status(400).json({ message: "Email or username and OTP are required" });
    }
    let user = null;
    if (email) {
      user = await userModel.findOne({ email });
    }
    if (!user && username) {
      user = await userModel.findOne({ username });
    }
    console.debug('[verifyForgotPasswordOTP] lookup result:', !!user, user ? { id: user._id, email: user.email, provider: user.provider } : null);
    if (!user) {
      console.info('[verifyForgotPasswordOTP] user not found for', { email, username });
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({ message: "OTP not found. Please request a new OTP." });
    }
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
    }
    if (user.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    user.otp = undefined;
    user._canResetPassword = true; 
    await user.save();
    return res.status(200).json({
      message: "OTP verified. You can now reset your password.",
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.error("Verify forgot password OTP error:", error);
    return res.status(500).json({ message: "Something went wrong while verifying OTP" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, username, newPassword } = req.body;
    console.debug('[resetPassword] request body:', { email, username, newPasswordProvided: !!newPassword });
    
    if ((!email && !username) || !newPassword) {
      return res.status(400).json({ message: "Email or username and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    
    let user = null;
    if (email) {
      user = await userModel.findOne({ email });
    }
    if (!user && username) {
      user = await userModel.findOne({ username });
    }
    
    if (!user) {
      console.info('[resetPassword] user not found for', { email, username });
      return res.status(404).json({ message: "User not found" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    
    await publishToQueue('AUTH_NOTIFICATION.PASSWORD_UPDATED', {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
    });
    
    return res.status(200).json({
      message: "Password reset successful. You can now login with your new password.",
    });
    
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Something went wrong while resetting password" });
  }
};

export const oauthCallback = (provider) => async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.redirect('/api/auth/oauth-failure');
    
    const isNewUser = req.authInfo?.isNewUser || false;
    
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (isNewUser) {
      await publishToQueue('AUTH_NOTIFICATION.OAUTH_WELCOME', {
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        provider: provider,
      });
    } else {
      await publishToQueue('AUTH_NOTIFICATION.LOGIN_SUCCESS', {
        email: user.email,
        fullName: user.fullName,
        username: user.username,
      });
    }
    
    res.redirect(process.env.FRONTEND_URL || '/');
  } catch (error) {
    console.error(`${provider} OAuth callback error:`, error);
    res.redirect('/api/auth/oauth-failure');
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      message: 'Something went wrong during logout',
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        fullName: req.user.fullName,
        profilePic: req.user.profilePic,
        provider: req.user.provider,
        isVerified: req.user.isVerified,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      message: 'Failed to fetch user information',
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, fullName, currentPassword, newPassword } = req.body;

    const user = await userModel.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username !== undefined) {
      const raw = typeof username === 'string' ? username : String(username);
      const trimmed = raw.trim();

      if (trimmed === '') {
        user.username = '';
      } else if (trimmed !== user.username) {
        const existingUser = await userModel.findOne({ username: trimmed });
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
          return res.status(400).json({ message: 'Username already taken' });
        }
        user.username = trimmed;
      }
    }

    if (fullName !== undefined) {
      let parsedFullName = fullName;

      if (typeof fullName === 'string') {
        try {
          parsedFullName = JSON.parse(fullName);
        } catch {
          parsedFullName = null;
        }
      }

      if (parsedFullName && typeof parsedFullName === 'object') {
        user.fullName ||= {};

        if (parsedFullName.firstName !== undefined) {
          user.fullName.firstName = parsedFullName.firstName;
        }
        if (parsedFullName.lastName !== undefined) {
          user.fullName.lastName = parsedFullName.lastName;
        }
      }
    }

    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({
        message: 'Both current and new password are required',
      });
    }

    if (currentPassword && newPassword) {
      if (user.provider !== 'email') {
        return res.status(400).json({
          message: 'Password cannot be changed for OAuth accounts',
        });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(400).json({
          message: 'Current password is incorrect',
        });
      }

      user.password = await bcrypt.hash(newPassword, 12);
    }

    if (req.file && req.file.size > 0) {
      const uploaded = await uploadImage({ buffer: req.file.buffer });
      if (uploaded?.url) {
        user.profilePic = uploaded.url;
      }
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic,
        provider: user.provider,
        isVerified: user.isVerified,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};
