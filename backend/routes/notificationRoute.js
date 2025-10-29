import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
} from "../controllers/notificationController.js";
import authUser from "../middlewares/auth.js";
import adminAuth from "../middlewares/adminAuth.js";

const notificationRouter = express.Router();

// Admin routes
notificationRouter.post("/create", adminAuth, createNotification);

// User routes
notificationRouter.get("/user/:userId", authUser, getUserNotifications);
notificationRouter.get("/stats/:userId", authUser, getNotificationStats);
notificationRouter.put("/read/:notificationId", authUser, markAsRead);
notificationRouter.put("/read-all", authUser, markAllAsRead);
notificationRouter.delete("/:notificationId", authUser, deleteNotification);
notificationRouter.delete("/user/all", authUser, deleteAllNotifications);

export default notificationRouter;