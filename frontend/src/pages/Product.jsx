import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../contexts/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import ReviewSection from "../components/ReviewSection";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [activeTab, setActiveTab] = useState('description');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0); // Novo estado para preço atual

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        // Definir preço inicial (primeiro tamanho ou preço base)
        if (item.sizes && item.sizes.length > 0) {
          if (typeof item.sizes[0] === 'object' && item.sizes[0].price) {
            setCurrentPrice(item.sizes[0].price);
            setSize(item.sizes[0].size);
          } else {
            setCurrentPrice(item.price);
            setSize(item.sizes[0]);
          }
        } else {
          setCurrentPrice(item.price);
        }
        return null;
      }
    });
  };

  // Função para atualizar preço quando tamanho muda
  const handleSizeChange = (selectedSize) => {
    setSize(selectedSize);
    
    if (productData.sizes && productData.sizes.length > 0) {
      // Verificar se sizes é array de objetos com preços
      if (typeof productData.sizes[0] === 'object' && productData.sizes[0].price) {
        const sizeData = productData.sizes.find(s => s.size === selectedSize);
        if (sizeData) {
          setCurrentPrice(sizeData.price);
        }
      } else {
        // Formato antigo - usar preço base
        setCurrentPrice(productData.price);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!size) {
      const sizeSelector = document.querySelector('.size-selector');
      if (sizeSelector) {
        sizeSelector.classList.add('animate-shake');
        setTimeout(() => sizeSelector.classList.remove('animate-shake'), 500);
      }
      return;
    }

    setIsLoading(true);
    await addToCart(productData._id, size);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  return productData ? (
    <div className="min-h-screen bg-white">
      {/* Header Section - VIP */}
      <div className="border-b border-gray-200 bg-gradient-to-b from-[#f8f6f2] to-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="prata-regular text-3xl lg:text-4xl text-[#111111] tracking-tight">
              {productData.name}
            </h1>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-[#414141]">(122 avaliações)</span>
            </div>
            {/* Badges elegantes */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {productData.category && (
                <span className="px-3 py-1 rounded-full border border-gray-300 text-[#414141] text-xs">{productData.category}</span>
              )}
              {productData.subCategory && (
                <span className="px-3 py-1 rounded-full border border-gray-300 text-[#414141] text-xs">{productData.subCategory}</span>
              )}
              {productData.olfactiveFamily && (
                <span className="px-3 py-1 rounded-full border border-gray-300 text-[#414141] text-xs">{productData.olfactiveFamily}</span>
              )}
              {productData.brand && (
                <span className="px-3 py-1 rounded-full border border-gray-300 text-[#414141] text-xs">{productData.brand}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Product Section - Layout VIP */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Product Images - Galeria elegante */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden shadow-sm">
              <img
                className="w-full h-full object-cover"
                src={image}
                alt={productData.name}
                fetchpriority="high"
                loading="eager"
                decoding="async"
                width="1000"
                height="1000"
              />
            </div>
            <div className="flex gap-3 justify-center">
              {productData.image.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setImage(item)}
                  className={`w-16 h-16 rounded-md overflow-hidden ring-1 transition ${
                    image === item 
                      ? 'ring-[#414141] ring-2' 
                      : 'ring-gray-300'
                  }`}
                >
                  <img
                    src={item}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="200"
                    height="200"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information - bloco sticky premium */}
          <div className="space-y-8 lg:sticky lg:top-24">
            {/* Price Section - Simples */}
            <div className="rounded-xl bg-[#f9f7f4] p-6 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="text-4xl prata-regular text-[#111111] mb-1">
                  {currency}{currentPrice}
                </div>
                <div className="text-[#414141] text-xs">
                  ou 12x de {currency}{(currentPrice / 12).toFixed(2)} sem juros
                </div>
              </div>
            </div>

            {/* Product Description - Clean */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#111111] tracking-tight">Descrição</h3>
              <p className="text-[#414141] leading-relaxed text-sm">
                {productData.description}
              </p>
            </div>

            {/* Size Selection - Minimalista */}
            <div className="size-selector space-y-3">
              <h3 className="text-lg font-semibold text-[#111111] tracking-tight">Tamanho</h3>
              <div className="flex gap-2 flex-wrap">
                {productData.sizes.map((item, index) => {
                  // Suportar tanto formato antigo (string) quanto novo (objeto)
                  const sizeValue = typeof item === 'object' ? item.size : item;
                  const sizePrice = typeof item === 'object' ? item.price : productData.price;
                  
                  return (
                    <button
                      onClick={() => handleSizeChange(sizeValue)}
                      key={index}
                      className={`px-4 py-2 border font-medium rounded-md transition-all ${
                        sizeValue === size 
                          ? "border-[#414141] bg-[#414141] text-white" 
                          : "border-gray-300 text-[#414141] hover:border-[#414141]"
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium">{sizeValue}</div>
                        {typeof item === 'object' && (
                          <div className="text-xs opacity-75 mt-0.5">
                            {currency}{sizePrice}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons - Simples */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full bg-[#111111] text-white px-6 py-3 font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-md"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ADICIONANDO AO CARRINHO...
                  </>
                ) : (
                  'ADICIONAR AO CARRINHO'
                )}
              </button>
              
              <button
                onClick={() => {
                  if (isInWishlist(productId)) {
                    removeFromWishlist(productId);
                  } else {
                    addToWishlist(productId);
                  }
                }}
                className={`w-full flex items-center justify-center gap-3 px-6 py-3 font-medium border rounded-md transition-colors ${
                  isInWishlist(productId)
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'border-gray-300 text-[#414141] hover:border-[#414141]'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                {isInWishlist(productId) ? 'REMOVER DOS FAVORITOS' : 'ADICIONAR AOS FAVORITOS'}
              </button>
            </div>

            {/* Trust Badges - Minimalista */}
            <div className="grid grid-cols-1 gap-3 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-[#414141]">
                <svg className="w-5 h-5 text-[#111111]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
                </svg>
                <span>Produto 100% Original</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#414141]">
                <svg className="w-5 h-5 text-[#111111]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <span>Pagamento Seguro</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#414141]">
                <svg className="w-5 h-5 text-[#111111]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 7l-9 9-5-5" />
                </svg>
                <span>Troca Garantida até 7 dias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Section - Premium */}
      <div className="border-t border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Tab Navigation - Pill */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-[#f9f7f4] rounded-full p-1 border border-gray-200">
              {[
                { id: "characteristics", label: "Características" },
                { id: "why-choose", label: "Por que escolher?" },
                { id: "care", label: "Cuidados" },
                { id: "warranty", label: "Garantia" },
                { id: "reviews", label: "Avaliações" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#111111] text-white"
                      : "text-[#414141] hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab !== "reviews" ? (
            <div className="max-w-4xl mx-auto">
              {/* Características */}
              {activeTab === "characteristics" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-[#111111] text-center mb-8 tracking-tight">
                    Características Principais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#111111] mb-2">Categoria</h4>
                      <p className="text-[#414141]">{productData.category}</p>
                    </div>
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#111111] mb-2">Subcategoria</h4>
                      <p className="text-[#414141]">{productData.subCategory}</p>
                    </div>
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#111111] mb-2">Tamanhos</h4>
                      <p className="text-[#414141]">{Array.isArray(productData.sizes) ? productData.sizes.map(s => (typeof s === 'object' ? s.size : s)).join(', ') : '-'}</p>
                    </div>
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#111111] mb-2">Status</h4>
                      <p className="text-[#414141]">Em Estoque</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Por que escolher */}
              {activeTab === "why-choose" && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-semibold text-[#111111] text-center mb-8 tracking-tight">
                    Descubra por que esse perfume é único.
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#414141] mb-3">QUALIDADE PREMIUM</h4>
                      <p className="text-[#414141] text-sm">Fragrância de padrão internacional, com fixação intensa e notas que revelam sofisticação e elegância a cada borrifada.</p>
                    </div>
                    <div className="text-center p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#414141] mb-3">VERSATILIDADE</h4>
                      <p className="text-[#414141] text-sm">Ideal para qualquer ocasião — do cotidiano aos momentos mais marcantes — adaptando-se perfeitamente ao seu estilo e presença.</p>
                    </div>
                    <div className="text-center p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#414141] mb-3">EXCLUSIVIDADE</h4>
                      <p className="text-[#414141] text-sm">Uma fragrância singular, feita para quem gosta de se destacar e deixar sua marca por onde passa.</p>
                    </div>
                    <div className="text-center p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#414141] mb-3">LONGA DURAÇÃO</h4>
                      <p className="text-[#414141] text-sm">Fixação poderosa que permanece na pele e nas lembranças — uma presença que dura o dia inteiro (e a noite também).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cuidados */}
              {activeTab === "care" && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-semibold text-[#111111] text-center mb-8 tracking-tight">
                    Cuidados e Conservação da Sua Fragrância
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#414141] mb-3">Temperatura</h4>
                      <p className="text-[#414141] text-sm">Guarde seu perfume em um local fresco e arejado, longe do calor intenso e da luz solar direta, para preservar a integridade das notas olfativas.</p>
                    </div>
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#414141] mb-3">Umidade</h4>
                      <p className="text-[#414141] text-sm">Evite ambientes úmidos, como banheiros, pois a umidade pode alterar a composição e a durabilidade da fragrância.</p>
                    </div>
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#414141] mb-3">Armazenamento</h4>
                      <p className="text-[#414141] text-sm">Mantenha o frasco na embalagem original, protegendo-o da luz e da oxidação para conservar sua essência por mais tempo.</p>
                    </div>
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-[#414141] mb-3">Conservação</h4>
                      <p className="text-[#414141] text-sm">Feche bem a tampa após cada uso para evitar evaporação e garantir que o aroma permaneça intenso até a última borrifada.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Garantia */}
              {activeTab === "warranty" && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-semibold text-[#111111] text-center mb-8 tracking-tight">
                    Garantia e Política de Troca
                  </h3>
                  <div className="border border-gray-200 p-8 rounded-xl bg-white">
                    <div className="text-center mb-6">
                      <div className="text-4xl prata-regular text-[#111111] mb-2">7 DIAS</div>
                      <p className="text-[#414141]">Garantia de troca</p>
                    </div>
                    <div className="space-y-4 text-[#414141] text-sm text-center">
                      <p>• Oferecemos 7 dias para troca ou devolução a partir da data de recebimento.</p>
                      <p>• O produto deve estar em perfeitas condições, com embalagem original.</p>
                      <p>• Frete de devolução por conta do cliente, exceto em casos de defeito.</p>
                      <p>• Produtos lacrados serão aceitos para troca apenas se não violados.</p>
                      <p>• Entre em contato conosco para iniciar o processo de troca.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-[#111111] text-center mb-8 tracking-tight">Avaliações</h3>
                <div className="border border-gray-200 rounded-xl p-6 bg-white">
                  <ReviewSection productId={productId} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="border-t border-gray-200 py-12">
        <RelatedProducts
          category={productData.category}
          subCategory={productData.subCategory}
        />
      </div>
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
