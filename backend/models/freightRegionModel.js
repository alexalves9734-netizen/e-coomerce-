import mongoose from "mongoose";

const freightRegionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  states: [{
    type: String,
    required: true
  }],
  cities: [{
    name: String,
    state: String,
    customPrice: Number // Preço customizado para cidade específica
  }],
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  freeShippingThreshold: {
    type: Number,
    default: 0 // Valor mínimo para frete grátis
  },
  isFreeShipping: {
    type: Boolean,
    default: false // Se true, esta região sempre tem frete grátis
  },
  deliveryTime: {
    min: {
      type: Number,
      required: true,
      min: 1
    },
    max: {
      type: Number,
      required: true,
      min: 1
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar updatedAt
freightRegionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices para otimização
freightRegionSchema.index({ states: 1 });
freightRegionSchema.index({ active: 1 });
freightRegionSchema.index({ 'cities.name': 1, 'cities.state': 1 });

const FreightRegion = mongoose.model("FreightRegion", freightRegionSchema);

export default FreightRegion;