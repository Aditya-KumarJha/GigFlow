import Notification from '../models/notification.model.js';

export const getNotifications = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const [total, notifications] = await Promise.all([
      Notification.countDocuments({ userId: req.user._id }),
      Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    return res.status(200).json({
      notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      message: 'Failed to fetch notifications',
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({
      message: 'Failed to mark notification as read',
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(500).json({
      message: 'Failed to mark all notifications as read',
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({
      message: 'Failed to delete notification',
    });
  }
};
