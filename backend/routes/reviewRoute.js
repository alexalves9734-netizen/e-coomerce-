import express from "express";
import { 
  addReview, 
  getProductReviews, 
  updateReview, 
  deleteReview, 
  markHelpful, 
  getUserReviews 
} from "../controllers/reviewController.js";
import authUser from "../middlewares/auth.js";

const reviewRouter = express.Router();

// Adicionar nova avaliação (requer autenticação)
reviewRouter.post('/add', authUser, addReview);

// Obter avaliações de um produto (público)
reviewRouter.post('/product', getProductReviews);

// Atualizar avaliação (requer autenticação)
reviewRouter.post('/update', authUser, updateReview);

// Deletar avaliação (requer autenticação)
reviewRouter.post('/delete', authUser, deleteReview);

// Marcar avaliação como útil (público)
reviewRouter.post('/helpful', markHelpful);

// Obter avaliações do usuário (requer autenticação)
reviewRouter.get('/user', authUser, getUserReviews);

export default reviewRouter;