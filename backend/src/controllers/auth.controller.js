import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { generateOTP } from "../utils/generate.otp.js";
import { publishToQueue } from "../broker/broker.js";
import { uploadImage } from "../services/imagekit.service.js";
import fs from "fs/promises";

export const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      username,
      provider = "email",
    } = req.body;

    // 1. Basic validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (provider === "email" && !password) {
      return res
        .status(400)
        .json({ message: "Password is required for email signup" });
    }

    // 2. Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // If OTP expired, allow re-registration by deleting old user
        if (!existingUser.otp || !existingUser.otp.expiresAt || existingUser.otp.expiresAt < new Date()) {
          await userModel.deleteOne({ _id: existingUser._id });
        } else {
          return res.status(409).json({ message: "User already exists with this email. Please verify your email or wait for OTP to expire." });
        }
      } else {
        return res.status(409).json({ message: "User already exists with this email" });
      }
    }

    // 3. Hash password
    let hashedPassword;
    if (provider === "email") {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // 4. Generate OTP
    const otpData = generateOTP();
    console.log("Generated OTP for signup:", otpData.code); // For testing purposes

    // 5. Create user
    await userModel.create({
      email,
      password: hashedPassword,
      fullName,
      username,
      provider,
      otp: otpData,
      isVerified: false,
    });

    // 6. Send email via queue (NON-BLOCKING)
    await publishToQueue('AUTH_NOTIFICATION.REGISTER_OTP', {
      email,
      fullName,
      username,
      otpCode: otpData.code,
    });

    // 7. Respond immediately
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

    // 1. Input validation
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // 2. Fetch user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 3. Already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "User is already verified",
      });
    }

    // 4. OTP not generated / missing
    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP.",
      });
    }

    // 5. OTP expired
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // 6. OTP mismatch
    if (user.otp.code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // 7. Success → verify user
    user.isVerified = true;
    user.otp = undefined; // prevent reuse

    await user.save();

    // 8. Generate JWT and set cookie
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
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 9. Send welcome email
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
      },
      token, // Optional: for client-side use if needed
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

    // Find user by email or username
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

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "User is already verified",
      });
    }

    // Generate new OTP (invalidate old one)
    const otpData = generateOTP();
    console.log("Resent OTP code:", otpData.code); // For testing purposes
    user.otp = otpData;
    await user.save();

    // Send email via queue
    await publishToQueue('AUTH_NOTIFICATION.RESEND_OTP', {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      otpCode: otpData.code,
    });

    // Response
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

    // Find user by email or username
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

    // Provider check
    if (user.provider !== "email") {
      return res.status(400).json({
        message: `Please login using ${user.provider}`,
      });
    }

    // Email verification check
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    // Password match
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Generate OTP for login
    const otpData = generateOTP();
    console.log("Generated OTP for login:", otpData.code); // For testing purposes
    user.otp = otpData;
    await user.save();

    // Send OTP via queue
    await publishToQueue('AUTH_NOTIFICATION.LOGIN_OTP', {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      otpCode: otpData.code,
    });

    // Respond (NOT logged in yet)
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

    // Find user by email or username
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

    // OTP existence
    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({
        message: "OTP not found. Please login again.",
      });
    }

    // OTP expired
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired. Please login again.",
      });
    }

    // OTP match
    if (user.otp.code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Clear OTP
    user.otp = undefined;
    await user.save();

    // Generate JWT and set cookie
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
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    // Send login success email
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
      },
      token, // Optional: for client-side use if needed
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
    // Find user by email or username
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
    // Generate OTP for password reset
    const otpData = generateOTP();
    console.log("Generated OTP for forgot password:", otpData.code); // For testing purposes
    user.otp = otpData;
    await user.save();
    // Send OTP email via queue
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
    if (!user) {
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
    user._canResetPassword = true; // Not persisted, just for this request
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
    
    if ((!email && !username) || !newPassword) {
      return res.status(400).json({ message: "Email or username and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    
    // Find user
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
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    
    // Send password update confirmation email
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
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    // Send welcome/login email via queue
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
    // Clear the JWT cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
    // req.user is set by authMiddleware
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

    // Find user with password field
    const user = await userModel.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update username if provided
    if (username !== undefined && username !== user.username) {
      // Check if username is already taken
      const existingUser = await userModel.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    // Update fullName if provided
    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    // Update password if both current and new password provided
    if (currentPassword && newPassword) {
      // Only allow password update for email provider
      if (user.provider !== 'email') {
        return res.status(400).json({ 
          message: 'Password cannot be changed for OAuth accounts' 
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: 'New password must be at least 6 characters long' 
        });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
    }

    // Handle profile picture upload
    if (req.file) {
      try {
        let buffer = req.file.buffer;
        if (!buffer && req.file.path) {
          buffer = await fs.readFile(req.file.path);
        }
        const uploaded = await uploadImage({ buffer });
        user.profilePic = uploaded.url;
      } catch (err) {
        console.error('Profile picture upload failed:', err);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }
    }

    await user.save();

    // Send profile updated notification
    try {
      await publishToQueue('AUTH_NOTIFICATION.PROFILE_UPDATED', {
        email: user.email,
        fullName: user.fullName,
        username: user.username,
      });
    } catch (err) {
      console.error('Failed to publish profile updated event:', err);
    }

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

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      message: 'Failed to update profile',
    });
  }
};

