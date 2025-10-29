import express from "express";
import {
  calculateFreight,
  createDelivery,
  listDeliveries,
  updateDeliveryStatus,
  trackDeliveryOrder,
  sendDeliveryEmail,
  updateDelivery,
  deleteDelivery,
  getDelivery
} from "../controllers/deliveryController.js";
import adminAuth from "../middlewares/adminAuth.js";
import authUser from "../middlewares/auth.js";

const deliveryRouter = express.Router();

// Rotas públicas
deliveryRouter.post('/calculate-shipping', calculateFreight); // Calcular frete
deliveryRouter.get('/track/:trackingCode', trackDeliveryOrder); // Rastrear entrega

// Rotas protegidas (usuário logado)
// deliveryRouter.post('/create', authUser, createDelivery); // Criar entrega (usuário)

// Rotas administrativas
deliveryRouter.post('/create', adminAuth, createDelivery); // Criar entrega (admin)
deliveryRouter.get('/list', adminAuth, listDeliveries); // Listar entregas
deliveryRouter.get('/:deliveryId', adminAuth, getDelivery); // Obter entrega específica
deliveryRouter.put('/:deliveryId', adminAuth, updateDelivery); // Atualizar entrega completa
deliveryRouter.put('/update-status/:deliveryId', adminAuth, updateDeliveryStatus); // Atualizar apenas status
deliveryRouter.delete('/:deliveryId', adminAuth, deleteDelivery); // Deletar entrega
deliveryRouter.post('/send-email/:deliveryId', adminAuth, sendDeliveryEmail); // Enviar email

export default deliveryRouter;