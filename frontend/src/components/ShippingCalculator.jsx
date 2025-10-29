import React, { useState, useContext } from 'react';
import { ShopContext } from '../contexts/ShopContext';

const ShippingCalculator = ({ onShippingSelect }) => {
  const { backendUrl, getCartAmount, setShippingCost, cartItems, products } = useContext(ShopContext);
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [error, setError] = useState('');

  // Função para calcular o peso total dos produtos no carrinho
  const calculateTotalWeight = () => {
    let totalWeight = 0;
    
    for (const itemId in cartItems) {
      const product = products.find(p => p._id === itemId);
      if (product) {
        for (const size in cartItems[itemId]) {
          const quantity = cartItems[itemId][size];
          if (quantity > 0) {
            // Peso estimado por produto (você pode adicionar um campo weight nos produtos)
            // Por enquanto, usando peso padrão de 0.5kg por item
            const itemWeight = product.weight || 0.5;
            totalWeight += itemWeight * quantity;
          }
        }
      }
    }
    
    // Peso mínimo de 0.5kg para cálculo de frete
    return Math.max(totalWeight, 0.5);
  };

  const calculateShipping = async () => {
    if (!cep || cep.length < 8) {
      setError('Por favor, insira um CEP válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${backendUrl}/api/freight/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep: cep.replace(/\D/g, ''),
          weight: calculateTotalWeight(),
          orderValue: getCartAmount()
        }),
      });

      const data = await response.json();

      if (data.success) {
        const shippingData = {
          regional: {
            success: true,
            carrier: data.data.region,
            cost: data.data.price,
            estimatedDays: `${data.data.deliveryTime.min}-${data.data.deliveryTime.max}`,
            freeShipping: data.data.freeShipping,
            details: data.data
          }
        };
        setShippingOptions(shippingData);

        const selectedOption = {
          type: 'regional',
          carrier: data.data.region,
          service: data.data.freeShipping ? 'Frete Grátis' : 'Entrega Regional',
          cost: data.data.price,
          estimatedDays: `${data.data.deliveryTime.min}-${data.data.deliveryTime.max}`,
          details: data.data
        };

        setSelectedShipping(selectedOption);
        setShippingCost(selectedOption);
        onShippingSelect && onShippingSelect(selectedOption);
      } else {
        // Fallback: usar o cálculo de entrega do módulo delivery
        const fb = await fetch(`${backendUrl}/api/delivery/calculate-shipping`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            zipCode: cep.replace(/\D/g, ''),
            weight: calculateTotalWeight(),
            dimensions: {}
          }),
        });
        const fbData = await fb.json();

        if (fbData.success) {
          const options = fbData.options || {};
          const regional = options.regional;
          const national = Array.isArray(options.national) ? options.national : [];

          const shippingData = {
            regional: regional || null,
            national: national
          };
          setShippingOptions(shippingData);

          // Selecionar automaticamente: preferir regional, senão o mais barato nacional
          let selectedOption = null;
          if (regional && regional.success) {
            selectedOption = {
              type: 'regional',
              carrier: regional.carrier,
              service: 'Entrega Regional',
              cost: regional.cost,
              estimatedDays: regional.estimatedDays,
              details: regional
            };
          } else if (national.length > 0) {
            const cheapest = national.reduce((min, cur) => (cur.cost < min.cost ? cur : min));
            selectedOption = {
              type: 'national',
              carrier: cheapest.carrier,
              service: cheapest.service,
              cost: cheapest.cost,
              estimatedDays: cheapest.estimatedDays,
              details: cheapest
            };
          }

          if (selectedOption) {
            setSelectedShipping(selectedOption);
            setShippingCost(selectedOption);
            onShippingSelect && onShippingSelect(selectedOption);
            setError('');
          } else {
            setError(fbData.message || 'Nenhuma opção de entrega disponível para este CEP.');
            setShippingOptions(null);
          }
        } else {
          setError(fbData.message || data.message || 'Erro ao calcular frete');
          setShippingOptions(null);
        }
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      setError('Erro ao calcular frete. Tente novamente.');
      setShippingOptions(null);
    } finally {
      setLoading(false);
    }
  };

  const selectShippingOption = (option) => {
    setSelectedShipping(option);
    setShippingCost(option); // Atualizar o contexto
    if (onShippingSelect) {
      onShippingSelect(option);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        📦 Calcular Frete
      </h3>

      {/* Input CEP */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CEP de Entrega
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cep}
            onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
            placeholder="00000000"
            maxLength={8}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={calculateShipping}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>

      {/* Opções de Frete */}
      {shippingOptions && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Opções de Entrega:</h4>

          {/* Entrega Regional */}
          {shippingOptions.regional && shippingOptions.regional.success && (
            <div
              onClick={() => selectShippingOption({
                type: 'regional',
                carrier: shippingOptions.regional.carrier,
                service: shippingOptions.regional.freeShipping ? 'Frete Grátis' : 'Entrega Regional',
                cost: shippingOptions.regional.cost,
                estimatedDays: shippingOptions.regional.estimatedDays,
                details: shippingOptions.regional.details
              })}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedShipping?.type === 'regional' && selectedShipping?.carrier === shippingOptions.regional.carrier
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {shippingOptions.regional.freeShipping ? '🎉' : '🚚'}
                    </span>
                    <span className="font-medium">
                      {shippingOptions.regional.freeShipping ? 'Frete Grátis' : 'Entrega Regional'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Entrega em {shippingOptions.regional.estimatedDays} dias úteis
                  </p>
                  <p className="text-xs text-gray-500">
                    Região: {shippingOptions.regional.carrier}
                  </p>
                  {shippingOptions.regional.details?.cepInfo && (
                    <p className="text-xs text-gray-500">
                      {shippingOptions.regional.details.cepInfo.localidade} - {shippingOptions.regional.details.cepInfo.uf}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${shippingOptions.regional.freeShipping ? 'text-green-600' : 'text-blue-600'}`}>
                    {shippingOptions.regional.freeShipping ? 'GRÁTIS' : `R$ ${shippingOptions.regional.cost.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Entrega Nacional */}
          {/* Removido - agora usando apenas sistema regional baseado em CEP */}

          {/* Nenhuma opção disponível */}
          {shippingOptions.regional && !shippingOptions.regional.success && (
            <div className="p-3 border border-red-200 rounded-lg bg-red-50">
              <p className="text-red-600 text-sm">
                Nenhuma opção de entrega disponível para este CEP.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Frete Selecionado */}
      {selectedShipping && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Frete Selecionado:</h4>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">
                {selectedShipping.service} - {selectedShipping.carrier}
              </p>
              <p className="text-xs text-gray-600">
                Entrega em {selectedShipping.estimatedDays} dia{selectedShipping.estimatedDays > 1 ? 's' : ''} útil{selectedShipping.estimatedDays > 1 ? 'eis' : ''}
              </p>
            </div>
            <p className="font-semibold text-green-600">
              {selectedShipping.cost === 0 ? 'GRÁTIS' : `R$ ${selectedShipping.cost.toFixed(2)}`}
            </p>
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• Os prazos de entrega são contados em dias úteis</p>
        <p>• Peso total estimado: {calculateTotalWeight().toFixed(1)}kg</p>
        <p>• Consulte as condições de frete grátis por região</p>
      </div>
    </div>
  );
};

export default ShippingCalculator;