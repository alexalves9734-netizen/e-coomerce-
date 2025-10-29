import mongoose from "mongoose";

const trackingEventSchema = new mongoose.Schema({
  data: { type: String, required: true }, // Data do evento
  hora: { type: String, required: true }, // Hora do evento
  local: { type: String, required: true }, // Local do evento
  status: { type: String, required: true }, // Status do evento
  subStatus: { type: Array, default: [] }, // Sub-status adicional
  observacao: { type: String, default: "" } // Observações adicionais
}, { _id: false });

const trackingSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
    required: true,
    unique: true
  },
  trackingCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  servico: {
    type: String,
    default: "SEDEX"
  },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'returned', 'error'],
    default: 'pending'
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  eventos: [trackingEventSchema],
  emailNotifications: [{
    status: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false }
  }],
  // Informações adicionais da API dos Correios
  quantidade: { type: Number, default: 0 },
  host: { type: String, default: "" },
  // Controle de notificações
  notificationsSent: {
    type: Array,
    default: []
  },
  // Última verificação automática
  lastChecked: {
    type: Date,
    default: Date.now
  },
  // Controle de erros
  errorCount: {
    type: Number,
    default: 0
  },
  lastError: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Índices para otimização
trackingSchema.index({ trackingCode: 1 });
trackingSchema.index({ orderId: 1 });
trackingSchema.index({ status: 1 });
trackingSchema.index({ lastUpdate: 1 });

// Método para adicionar evento de rastreamento
trackingSchema.methods.addEvent = function(eventData) {
  // Verificar se o evento já existe para evitar duplicatas
  const existingEvent = this.eventos.find(event => 
    event.data === eventData.data && 
    event.hora === eventData.hora && 
    event.status === eventData.status
  );
  
  if (!existingEvent) {
    this.eventos.push(eventData);
    this.lastUpdate = new Date();
    
    // Atualizar status geral baseado no último evento
    this.updateGeneralStatus(eventData.status);
  }
  
  return this;
};

// Método para atualizar status geral
trackingSchema.methods.updateGeneralStatus = function(eventStatus) {
  const statusMap = {
    'Objeto entregue ao destinatário': 'delivered',
    'Entregue': 'delivered',
    'Objeto saiu para entrega ao destinatário': 'in_transit',
    'Objeto em trânsito': 'in_transit',
    'Objeto postado': 'in_transit',
    'Objeto devolvido': 'returned',
    'Devolução autorizada': 'returned'
  };
  
  const newStatus = statusMap[eventStatus] || 'in_transit';
  if (this.status !== newStatus) {
    this.status = newStatus;
  }
};

// Método para verificar se precisa de notificação por email
trackingSchema.methods.needsEmailNotification = function(eventStatus) {
  const importantStatuses = [
    'Objeto postado',
    'Objeto saiu para entrega ao destinatário',
    'Objeto entregue ao destinatário',
    'Objeto devolvido'
  ];
  
  return importantStatuses.includes(eventStatus) && 
         !this.notificationsSent.includes(eventStatus);
};

// Método para marcar notificação como enviada
trackingSchema.methods.markNotificationSent = function(status) {
  if (!this.notificationsSent.includes(status)) {
    this.notificationsSent.push(status);
    this.emailNotifications.push({
      status: status,
      emailSent: true
    });
  }
};

const trackingModel = mongoose.models.tracking || mongoose.model("tracking", trackingSchema);

export default trackingModel;