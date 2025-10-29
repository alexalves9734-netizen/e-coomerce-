import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../contexts/ShopContext';
import { assets } from '../assets/frontend_assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';

const ReviewSection = ({ productId }) => {
  const { token, backendUrl } = useContext(ShopContext);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);

  // Buscar avaliações do produto
  const fetchReviews = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/review/product', {
        productId
      });

      if (response.data.success) {
        setReviews(response.data.reviews);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Adicionar nova avaliação
  const handleAddReview = async () => {
    if (!token) {
      toast.error('Faça login para avaliar o produto');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Por favor, escreva um comentário');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/review/add', {
        productId,
        rating: newReview.rating,
        comment: newReview.comment
      });

      if (response.data.success) {
        toast.success('Avaliação adicionada com sucesso!');
        setNewReview({ rating: 5, comment: '' });
        setShowAddReview(false);
        fetchReviews(); // Recarregar avaliações
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Erro ao adicionar avaliação');
    }
    setLoading(false);
  };

  // Marcar avaliação como útil
  const handleMarkHelpful = async (reviewId) => {
    try {
      const response = await axios.post(backendUrl + '/api/review/helpful', {
        reviewId
      });

      if (response.data.success) {
        toast.success('Obrigado pelo feedback!');
        fetchReviews(); // Recarregar para atualizar contador
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Renderizar estrelas
  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <img
              src={star <= rating ? assets.star_icon : assets.star_dull_icon}
              alt="star"
              className="w-4 h-4"
            />
          </button>
        ))}
      </div>
    );
  };

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  return (
    <div className="mt-8">
      {/* Estatísticas das avaliações */}
      {stats.totalReviews > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#111111]">
                {stats.averageRating}
              </div>
              <div className="flex justify-center mb-1">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div className="text-sm text-gray-600">
                {stats.totalReviews} avaliação{stats.totalReviews !== 1 ? 'ões' : ''}
              </div>
            </div>
            
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#111111] h-2 rounded-full"
                      style={{
                        width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[star] / stats.totalReviews) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {stats.ratingDistribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botão para adicionar avaliação */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">
          Avaliações {stats.totalReviews > 0 && `(${stats.totalReviews})`}
        </h3>
        {token && (
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="bg-[#111111] text-white px-5 py-2.5 rounded-lg hover:bg-black transition-colors text-sm font-medium"
          >
            {showAddReview ? 'Cancelar' : 'Avaliar Produto'}
          </button>
        )}
      </div>

      {/* Formulário para adicionar avaliação */}
      {showAddReview && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h4 className="font-medium mb-4">Adicionar Avaliação</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Sua avaliação:</label>
            {renderStars(newReview.rating, true, (rating) => 
              setNewReview(prev => ({ ...prev, rating }))
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Comentário:</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Compartilhe sua experiência com este produto..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:border-black"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {newReview.comment.length}/500
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddReview}
              disabled={loading}
              className="bg-[#111111] text-white px-6 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
            <button
              onClick={() => setShowAddReview(false)}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de avaliações */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">
              <svg className="w-8 h-8 text-gray-400 mx-auto" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.25 8.029c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69L8.13 2.927z" />
              </svg>
            </div>
            <p>Seja o primeiro a avaliar este produto!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{review.userName}</span>
                    {review.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Compra Verificada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">
                      {formatDate(review.date)}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleMarkHelpful(review._id)}
                  className="text-gray-600 hover:text-[#111111] transition-colors flex items-center gap-1"
                >
                  👍 Útil ({review.helpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;