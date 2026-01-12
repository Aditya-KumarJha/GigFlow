import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';

/**
 * Middleware to verify JWT token from HttpOnly cookie
 * Protects routes that require authentication
 * Attaches user object to req.user for downstream use
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract token from cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required. Please login.',
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Session expired. Please login again.',
        });
      }
      return res.status(401).json({
        message: 'Invalid token. Please login again.',
      });
    }

    // 3. Fetch user from database (exclude password)
    const user = await userModel.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User not found. Please login again.',
      });
    }

    // 4. Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before accessing this resource.',
      });
    }

    // 5. Attach user to request object
    req.user = user;

    // 6. Proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      message: 'Internal server error during authentication.',
    });
  }
};

/**
 * Optional middleware to check authentication without enforcing it
 * Useful for routes where user info is optional (e.g., public gigs with owner info)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select('-password');

    req.user = user || null;
    next();
  } catch (error) {
    // Silent fail - just set user to null
    req.user = null;
    next();
  }
};
