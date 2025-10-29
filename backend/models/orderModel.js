import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: "Pedido Realizado" },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  date: { type: Number, required: true },
  // Novos campos para entrega
  deliveryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'delivery',
    default: null 
  },
  shippingCost: { 
    type: Number, 
    default: 0 
  },
  deliveryType: { 
    type: String, 
    enum: ['regional', 'national'],
    default: null 
  },
  trackingCode: { 
    type: String, 
    default: null 
  },
  orderNumber: {
    type: String,
    unique: true,
    default: function() {
      return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  // Campos para rastreamento automático
  trackingStatus: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'returned', 'error'],
    default: 'pending'
  },
  lastTrackingUpdate: {
    type: Date,
    default: null
  },
  trackingNotifications: {
    type: Boolean,
    default: true // Cliente quer receber notificações por email
  },
  customerEmail: {
    type: String,
    default: null // Email para notificações (pode ser diferente do email de login)
  }
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
