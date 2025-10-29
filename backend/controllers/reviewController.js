import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// Adicionar uma nova avaliação
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.body.userId;

    // Verificar se o produto existe
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Produto não encontrado" });
    }

    // Verificar se o usuário existe
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    // Verificar se o usuário já avaliou este produto
    const existingReview = await reviewModel.findOne({ userId, productId });
    if (existingReview) {
      return res.json({ success: false, message: "Você já avaliou este produto" });
    }

    // Criar nova avaliação
    const newReview = new reviewModel({
      userId,
      productId,
      rating: Number(rating),
      comment,
      userName: user.name,
      verified: false // Pode ser implementada lógica para verificar se o usuário comprou o produto
    });

    await newReview.save();

    res.json({ success: true, message: "Avaliação adicionada com sucesso" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Obter avaliações de um produto
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.body;

    const reviews = await reviewModel.find({ productId })
      .sort({ date: -1 })
      .populate('userId', 'name');

    // Calcular estatísticas das avaliações
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    // Distribuição de estrelas
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    res.json({ 
      success: true, 
      reviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Atualizar uma avaliação
const updateReview = async (req, res) => {
  try {
    const { reviewId, rating, comment } = req.body;
    const userId = req.body.userId;

    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.json({ success: false, message: "Avaliação não encontrada" });
    }

    // Verificar se o usuário é o autor da avaliação
    if (review.userId.toString() !== userId) {
      return res.json({ success: false, message: "Não autorizado" });
    }

    review.rating = Number(rating);
    review.comment = comment;
    review.date = Date.now();

    await review.save();

    res.json({ success: true, message: "Avaliação atualizada com sucesso" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Deletar uma avaliação
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    const userId = req.body.userId;

    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.json({ success: false, message: "Avaliação não encontrada" });
    }

    // Verificar se o usuário é o autor da avaliação
    if (review.userId.toString() !== userId) {
      return res.json({ success: false, message: "Não autorizado" });
    }

    await reviewModel.findByIdAndDelete(reviewId);

    res.json({ success: true, message: "Avaliação removida com sucesso" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Marcar avaliação como útil
const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.body;

    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.json({ success: false, message: "Avaliação não encontrada" });
    }

    review.helpful += 1;
    await review.save();

    res.json({ success: true, message: "Avaliação marcada como útil" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Obter avaliações do usuário
const getUserReviews = async (req, res) => {
  try {
    const userId = req.body.userId;

    const reviews = await reviewModel.find({ userId })
      .sort({ date: -1 })
      .populate('productId', 'name image price');

    res.json({ success: true, reviews });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { 
  addReview, 
  getProductReviews, 
  updateReview, 
  deleteReview, 
  markHelpful, 
  getUserReviews 
};