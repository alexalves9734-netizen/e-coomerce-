import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data, priority } = req.body;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    const notification = await notificationModel.createNotification(
      userId, type, title, message, data, priority
    );

    res.json({ success: true, notification });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalCount = await notificationModel.countDocuments(query);
    const unreadCount = await notificationModel.countDocuments({ userId, read: false });

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        unreadCount
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.userId;

    const notification = await notificationModel.findOne({
      _id: notificationId,
      userId: userId
    });

    if (!notification) {
      return res.json({ success: false, message: "Notificação não encontrada" });
    }

    await notification.markAsRead();

    res.json({ success: true, message: "Notificação marcada como lida" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    await notificationModel.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({ success: true, message: "Todas as notificações foram marcadas como lidas" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.userId;

    const notification = await notificationModel.findOneAndDelete({
      _id: notificationId,
      userId: userId
    });

    if (!notification) {
      return res.json({ success: false, message: "Notificação não encontrada" });
    }

    res.json({ success: true, message: "Notificação excluída com sucesso" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete all notifications for a user
const deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.body;

    await notificationModel.deleteMany({ userId });

    res.json({ success: true, message: "Todas as notificações foram excluídas" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await notificationModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] } },
          byType: {
            $push: {
              type: "$type",
              read: "$read"
            }
          }
        }
      }
    ]);

    const typeStats = {};
    if (stats.length > 0) {
      stats[0].byType.forEach(item => {
        if (!typeStats[item.type]) {
          typeStats[item.type] = { total: 0, unread: 0 };
        }
        typeStats[item.type].total++;
        if (!item.read) {
          typeStats[item.type].unread++;
        }
      });
    }

    res.json({
      success: true,
      stats: {
        total: stats.length > 0 ? stats[0].total : 0,
        unread: stats.length > 0 ? stats[0].unread : 0,
        byType: typeStats
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
};