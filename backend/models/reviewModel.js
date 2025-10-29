import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'product', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  userName: { 
    type: String, 
    required: true 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  helpful: { 
    type: Number, 
    default: 0 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

// Índice composto para evitar avaliações duplicadas do mesmo usuário para o mesmo produto
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;