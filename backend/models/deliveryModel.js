import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
    required: true
  },
  deliveryType: {
    type: String,
    enum: ['regional', 'national'],
    required: true
  },
  carrier: {
    type: String,
    enum: ['motoboy', 'correios', 'transportadora'],
    required: true
  },
  trackingCode: {
    type: String,
    default: null
  },
  shippingCost: {
    type: Number,
    required: true
  },
  estimatedDeliveryDays: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: { type: String },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Brasil' }
  },
  deliveryDetails: {
    motoboyName: { type: String },
    motoboyPhone: { type: String },
    scheduledDate: { type: Date },
    deliveredAt: { type: Date },
    receivedBy: { type: String },
    notes: { type: String }
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para melhor performance
deliverySchema.index({ orderId: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ trackingCode: 1 });
deliverySchema.index({ 'shippingAddress.zipCode': 1 });

const deliveryModel = mongoose.models.delivery || mongoose.model('delivery', deliverySchema);

export default deliveryModel;