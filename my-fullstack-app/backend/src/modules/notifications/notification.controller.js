const Notification = require("./notification.model");

const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { limit, offset } = req.query;
    const notifications = await Notification.getUserNotifications(userId, limit, offset);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const stats = await Notification.getNotificationStats(userId);
    res.json({ unreadCount: parseInt(stats.unread_notifications || 0) });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.markAsRead(id);
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const notifications = await Notification.markAllAsRead(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
