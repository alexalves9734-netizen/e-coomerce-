import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../contexts/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";
import CartTotal from "../components/CartTotal";
import CouponSection from "../components/CouponSection";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } =
    useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      setIsLoading(true);
      const tempData = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }

      setCartData(tempData);
      setTimeout(() => setIsLoading(false), 300); // Simula loading para animação
    }
  }, [cartItems, products]);

  const handleQuantityChange = (id, size, newQuantity) => {
    if (newQuantity === 0) {
      // Animação de remoção
      const element = document.querySelector(`[data-item="${id}-${size}"]`);
      if (element) {
        element.classList.add('animate-slideOut');
        setTimeout(() => {
          updateQuantity(id, size, newQuantity);
        }, 300);
      }
    } else {
      updateQuantity(id, size, newQuantity);
    }
  };

  const getTotalItems = () => {
    return cartData.reduce((total, item) => total + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="border-t pt-14 flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="border-t pt-14 animate-fadeIn">
      <div className="text-2xl mb-3 flex items-center gap-2">
        <Title text1={"SEU"} text2={"CARRINHO"} />
        {cartData.length > 0 && (
          <span className="bg-black text-white text-sm px-2 py-1 rounded-full animate-bounce-custom">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
          </span>
        )}
      </div>
      
      {cartData.length === 0 ? (
        <div className="text-center py-20 animate-fadeIn">
          <div className="mb-6">
            <img 
              src={assets.cart_icon} 
              alt="Carrinho vazio" 
              className="w-20 h-20 mx-auto opacity-50 mb-4"
            />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Seu carrinho está vazio</h3>
            <p className="text-gray-500">Adicione alguns produtos para começar suas compras!</p>
          </div>
          <button
            onClick={() => navigate('/collection')}
            className="bg-black hover:bg-gray-800 text-white px-8 py-3 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg btn-animate"
          >
            CONTINUAR COMPRANDO
          </button>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {cartData.map((item, index) => {
              const productData = products.find(
                (product) => product._id === item._id
              );
              
              // Calcular preço correto baseado no tamanho
              let itemPrice = productData.price;
              if (productData.sizes && productData.sizes.length > 0 && typeof productData.sizes[0] === 'object') {
                const sizeData = productData.sizes.find(s => s.size === item.size);
                itemPrice = sizeData ? sizeData.price : productData.price;
              }
              
              return (
                <div
                  key={index}
                  data-item={`${item._id}-${item.size}`}
                  className="py-6 px-4 border border-gray-200 rounded-lg text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 bg-white hover:shadow-md transition-all duration-300 card-hover animate-slideIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-6">
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        className="w-16 sm:w-20 transition-transform duration-300 hover:scale-110"
                        src={productData.image[0]}
                        alt={productData.name}
                        loading="lazy"
                        decoding="async"
                        width="160"
                        height="160"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-lg font-medium text-gray-800 hover:text-gray-600 transition-colors">
                        {productData.name}
                      </p>
                      <div className="flex items-center gap-5 mt-2">
                        <p className="text-black font-semibold">
                          {currency}
                          {itemPrice}
                        </p>
                        <span className="px-3 py-1 border border-gray-300 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {item.size}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Subtotal: {currency}{(itemPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.size, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-gray-600 hover:text-black"
                    >
                      -
                    </button>
                    <input
                      className="border border-gray-300 rounded-lg max-w-16 px-2 py-1 text-center focus:border-black focus:outline-none transition-colors"
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 1;
                        handleQuantityChange(item._id, item.size, newValue);
                      }}
                    />
                    <button
                      onClick={() => handleQuantityChange(item._id, item.size, item.quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-gray-600 hover:text-black"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleQuantityChange(item._id, item.size, 0)}
                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 group"
                    title="Remover item"
                  >
                    <img
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      src={assets.bin_icon}
                      alt="Remover"
                    />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end my-20">
            <div className="w-full sm:w-[450px] animate-slideIn space-y-6">
              <CouponSection />
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <CartTotal />
                <div className="w-full text-end mt-6">
                  <button
                    onClick={() => navigate("/place-order")}
                    className="w-full bg-black hover:bg-gray-800 text-white text-sm font-medium py-4 px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg btn-animate rounded-lg"
                  >
                    IR PARA O PAGAMENTO
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate('/collection')}
                    className="text-black hover:text-gray-600 text-sm font-medium transition-colors underline"
                  >
                    Continuar Comprando
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
