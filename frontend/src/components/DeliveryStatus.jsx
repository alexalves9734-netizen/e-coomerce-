import React from 'react';

const DeliveryStatus = ({ status, trackingCode, estimatedDays, deliveredAt, className = '' }) => {
  // Configurações dos status
  const statusConfig = {
    pending: {
      label: 'Pendente',
      icon: '⏳',
      color: 'yellow',
      description: 'Aguardando processamento'
    },
    processing: {
      label: 'Processando',
      icon: '📦',
      color: 'blue',
      description: 'Preparando para envio'
    },
    shipped: {
      label: 'Enviado',
      icon: '🚚',
      color: 'purple',
      description: 'Produto despachado'
    },
    in_transit: {
      label: 'Em Trânsito',
      icon: '🛣️',
      color: 'orange',
      description: 'A caminho do destino'
    },
    delivered: {
      label: 'Entregue',
      icon: '✅',
      color: 'green',
      description: 'Produto entregue'
    },
    cancelled: {
      label: 'Cancelado',
      icon: '❌',
      color: 'red',
      description: 'Entrega cancelada'
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.pending;

  // Cores baseadas no status
  const getColorClasses = (color) => {
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[color] || colors.yellow;
  };

  // Progresso visual
  const getProgressPercentage = () => {
    const progressMap = {
      pending: 10,
      processing: 25,
      shipped: 50,
      in_transit: 75,
      delivered: 100,
      cancelled: 0
    };
    return progressMap[status] || 0;
  };

  // Etapas do processo
  const steps = [
    { key: 'pending', label: 'Pedido Confirmado', icon: '📋' },
    { key: 'processing', label: 'Preparando', icon: '📦' },
    { key: 'shipped', label: 'Enviado', icon: '🚚' },
    { key: 'in_transit', label: 'Em Trânsito', icon: '🛣️' },
    { key: 'delivered', label: 'Entregue', icon: '✅' }
  ];

  const getStepStatus = (stepKey) => {
    const stepOrder = ['pending', 'processing', 'shipped', 'in_transit', 'delivered'];
    const currentIndex = stepOrder.indexOf(status);
    const stepIndex = stepOrder.indexOf(stepKey);
    
    if (status === 'cancelled') return 'cancelled';
    if (stepIndex <= currentIndex) return 'completed';
    return 'pending';
  };

  const getStepClasses = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'cancelled':
        return 'bg-red-500 text-white border-red-500';
      default:
        return 'bg-gray-200 text-gray-500 border-gray-300';
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      {/* Status Principal */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getColorClasses(currentStatus.color)}`}>
            {currentStatus.icon} {currentStatus.label}
          </span>
          <span className="text-gray-600 text-sm">{currentStatus.description}</span>
        </div>
        
        {trackingCode && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Código de Rastreamento</p>
            <p className="font-mono text-sm font-medium">{trackingCode}</p>
          </div>
        )}
      </div>

      {/* Barra de Progresso */}
      {status !== 'cancelled' && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Timeline de Etapas */}
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.key);
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs mb-1 ${getStepClasses(stepStatus)}`}>
                {stepStatus === 'completed' ? '✓' : step.icon}
              </div>
              <span className="text-xs text-center text-gray-600 max-w-16">
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="absolute w-full h-0.5 bg-gray-200 top-4 left-1/2 transform -translate-y-1/2 -z-10">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      getStepStatus(steps[index + 1].key) === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informações Adicionais */}
      <div className="flex justify-between items-center text-sm text-gray-600 pt-3 border-t">
        {status === 'delivered' && deliveredAt ? (
          <span>✅ Entregue em {new Date(deliveredAt).toLocaleDateString('pt-BR')}</span>
        ) : status === 'cancelled' ? (
          <span>❌ Entrega cancelada</span>
        ) : estimatedDays ? (
          <span>⏰ Prazo estimado: {estimatedDays} dias úteis</span>
        ) : (
          <span>📦 Acompanhe o status da sua entrega</span>
        )}
        
        {trackingCode && status !== 'delivered' && status !== 'cancelled' && (
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Rastrear Pedido →
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryStatus;