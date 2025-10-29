import React, { useState } from 'react';
import { toast } from 'react-toastify';

const OrderTracking = ({ trackingCode: propTrackingCode }) => {
  const [trackingCode, setTrackingCode] = useState(propTrackingCode || '');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');

  // Rastrear pedido
  const trackOrder = async () => {
    if (!trackingCode.trim()) {
      setError('Por favor, insira um código de rastreamento');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tracking/code/${trackingCode.trim()}`);
      const data = await response.json();

      if (data.success) {
        setTrackingData(data.tracking);
        toast.success('Informações de rastreamento encontradas!');
      } else {
        setError(data.message || 'Código de rastreamento não encontrado');
        toast.error(data.message || 'Código de rastreamento não encontrado');
      }
    } catch (error) {
      console.error('Erro ao rastrear pedido:', error);
      setError('Erro ao rastrear pedido. Tente novamente.');
      toast.error('Erro ao rastrear pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'in_transit': 'bg-orange-100 text-orange-800 border-orange-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'out_for_delivery': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Obter ícone do status
  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'processing': '📦',
      'shipped': '🚚',
      'in_transit': '🛣️',
      'delivered': '✅',
      'cancelled': '❌',
      'out_for_delivery': '🚛'
    };
    return icons[status] || '📋';
  };

  // Obter texto do status
  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pendente',
      'processing': 'Processando',
      'shipped': 'Enviado',
      'in_transit': 'Em Trânsito',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado',
      'out_for_delivery': 'Saiu para Entrega'
    };
    return texts[status] || status;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          📦 Rastreamento de Pedido
        </h2>

        {/* Formulário de Rastreamento */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Rastreamento
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="Ex: BR12345678AB ou MB87654321CD"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
            />
            <button
              onClick={trackOrder}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Rastreando...' : 'Rastrear'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Resultados do Rastreamento */}
        {trackingData && (
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Informações da Entrega</h3>
                  <p><strong>Código:</strong> {trackingData.trackingCode}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs border ${getStatusColor(trackingData.trackingStatus)}`}>
                      {getStatusIcon(trackingData.trackingStatus)} {getStatusText(trackingData.trackingStatus)}
                    </span>
                  </p>
                  <p><strong>Última Atualização:</strong> {new Date(trackingData.lastTrackingUpdate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Transportadora:</strong> {trackingData.carrier || 'Correios'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Detalhes do Pedido</h3>
                  <p><strong>Número:</strong> {trackingData.order?.orderNumber || trackingData.orderId}</p>
                  <p><strong>Valor:</strong> R$ {trackingData.order?.amount?.toFixed(2) || '0.00'}</p>
                  <p><strong>Data:</strong> {new Date(trackingData.order?.date || trackingData.createdAt).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Frete:</strong> R$ {trackingData.order?.shippingCost?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            {/* Endereço de Entrega */}
            {trackingData.order?.address && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  📍 Endereço de Entrega
                </h3>
                <p>
                  {trackingData.order.address.street}, {trackingData.order.address.number}
                  {trackingData.order.address.complement && `, ${trackingData.order.address.complement}`}
                </p>
                <p>{trackingData.order.address.neighborhood}</p>
                <p>{trackingData.order.address.city} - {trackingData.order.address.state}</p>
                <p>CEP: {trackingData.order.address.zipCode}</p>
              </div>
            )}

            {/* Itens do Pedido */}
            {trackingData.order?.items && trackingData.order.items.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  🛍️ Itens do Pedido
                </h3>
                <div className="space-y-2">
                  {trackingData.order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-green-200 last:border-b-0">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Histórico de Status */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📋 Histórico de Movimentação
              </h3>
              <div className="space-y-3">
                {trackingData.events && trackingData.events.length > 0 ? (
                  trackingData.events.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getStatusColor(event.status)}`}>
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.description}</p>
                        {event.location && <p className="text-sm text-gray-600">{event.location}</p>}
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString('pt-BR')} às {new Date(event.date).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhum evento de rastreamento disponível ainda.</p>
                )}
              </div>
            </div>

            {/* Rastreamento Externo (Correios) */}
            {trackingData.externalData && trackingData.externalData.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📮 Rastreamento dos Correios
                </h3>
                <div className="space-y-3">
                  {trackingData.externalData.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-yellow-200 last:border-b-0">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">{event.status}</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString('pt-BR')} às {new Date(event.date).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prazo Estimado */}
            {trackingData.trackingStatus !== 'delivered' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-purple-800 mb-2">⏰ Prazo Estimado</h3>
                <p className="text-purple-700">
                  Entrega prevista em até {trackingData.estimatedDelivery || '5-10'} dias úteis
                </p>
              </div>
            )}
          </div>
        )}

        {/* Informações de Ajuda */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Dicas de Rastreamento</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Códigos regionais começam com "MB" (Motoboy)</li>
            <li>• Códigos nacionais começam com "BR" (Correios)</li>
            <li>• Os prazos são contados em dias úteis</li>
            <li>• Em caso de dúvidas, entre em contato conosco</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;