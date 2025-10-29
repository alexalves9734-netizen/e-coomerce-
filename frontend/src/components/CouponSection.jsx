import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../contexts/ShopContext';

const CouponSection = () => {
  const { 
    appliedCoupon, 
    couponDiscount, 
    validateCoupon, 
    removeCoupon, 
    getActiveCoupons,
    token 
  } = useContext(ShopContext);
  
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [showActiveCoupons, setShowActiveCoupons] = useState(false);

  useEffect(() => {
    if (token) {
      loadActiveCoupons();
    }
  }, [token]);

  const loadActiveCoupons = async () => {
    const coupons = await getActiveCoupons();
    setActiveCoupons(coupons);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsLoading(true);
    await validateCoupon(couponCode);
    setIsLoading(false);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  const applyCouponFromList = async (code) => {
    setCouponCode(code);
    setIsLoading(true);
    await validateCoupon(code);
    setIsLoading(false);
    setCouponCode('');
    setShowActiveCoupons(false);
  };

  if (!token) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-gray-600 text-center">
          Faça login para usar cupons de desconto
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 tracking-tight">Cupom de Desconto</h3>
      <p className="text-xs text-gray-500">Aplique seu cupom para aproveitar benefícios exclusivos.</p>
      
      {appliedCoupon ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-green-800">
                Cupom Aplicado: {appliedCoupon.code}
              </p>
              <p className="text-sm text-green-600">
                {appliedCoupon.description}
              </p>
              <p className="text-sm font-medium text-green-700">
                Desconto: R$ {couponDiscount.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Digite o código do cupom"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isLoading || !couponCode.trim()}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Validando...' : 'Aplicar'}
            </button>
          </div>

          {activeCoupons.length > 0 && (
            <div>
              <button
                onClick={() => setShowActiveCoupons(!showActiveCoupons)}
                className="text-black hover:text-gray-700 text-sm font-medium"
              >
                {showActiveCoupons ? 'Ocultar' : 'Ver'} cupons disponíveis ({activeCoupons.length})
              </button>

              {showActiveCoupons && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                  {activeCoupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:border-black cursor-pointer transition-colors"
                      onClick={() => applyCouponFromList(coupon.code)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {coupon.code}
                          </p>
                          <p className="text-sm text-gray-600">
                            {coupon.description}
                          </p>
                          <div className="flex gap-4 text-xs text-gray-500 mt-1">
                            <span>
                              {coupon.discountType === 'percentage' 
                                ? `${coupon.discountValue}% OFF`
                                : `R$ ${coupon.discountValue} OFF`
                              }
                            </span>
                            {coupon.minimumOrderValue > 0 && (
                              <span>
                                Mín: R$ {coupon.minimumOrderValue.toFixed(2)}
                              </span>
                            )}
                            <span>
                              Válido até: {new Date(coupon.expirationDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2">
                          Usar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponSection;