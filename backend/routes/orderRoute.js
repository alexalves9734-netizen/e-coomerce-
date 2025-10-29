import express from "express";
import {
  placeOrder,
  allOrders,
  userOrders,
  updateStatus,
  getOrder,
  updateOrder,
  deleteOrder
} from "../controllers/orderController.js";
import adminAuth from "../middlewares/adminAuth.js";
import authUser from "../middlewares/auth.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.get("/:orderId", adminAuth, getOrder); // Obter pedido específico
orderRouter.put("/:orderId", adminAuth, updateOrder); // Atualizar pedido completo
orderRouter.post("/status", adminAuth, updateStatus); // Atualizar apenas status
orderRouter.delete("/:orderId", adminAuth, deleteOrder); // Deletar pedido

// Payment features
orderRouter.post("/place", authUser, placeOrder);

// User Features
orderRouter.post("/userorders", authUser, userOrders);

export default orderRouter;
