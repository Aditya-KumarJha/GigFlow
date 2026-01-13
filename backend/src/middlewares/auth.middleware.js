import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required. Please login.',
      });
    }

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

    const user = await userModel.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User not found. Please login again.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before accessing this resource.',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      message: 'Internal server error during authentication.',
    });
  }
};

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
    req.user = null;
    next();
  }
};
