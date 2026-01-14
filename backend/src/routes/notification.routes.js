import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';

const router = express.Router();

// Protected: Get user notifications
router.get('/', authMiddleware, getNotifications);

// Protected: Mark notification as read
router.patch('/:id/read', authMiddleware, markAsRead);

// Protected: Mark all notifications as read
router.patch('/read-all', authMiddleware, markAllAsRead);

// Protected: Delete notification
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
