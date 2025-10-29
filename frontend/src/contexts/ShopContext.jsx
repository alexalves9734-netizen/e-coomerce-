import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Configuração do interceptor do Axios
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const deliveryFee = 0; // Valor padrão 0, será substituído pelo frete calculado
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [calculatedShipping, setCalculatedShipping] = useState(null); // Novo estado para frete calculado
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      return toast.error("Select Size");
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + "/api/cart/add", { itemId, size });
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.log("Error in getCartCount: ", error);
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + "/api/cart/update", {
          itemId,
          size,
          quantity,
        });
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          try {
            // Verificar se o produto tem preços por tamanho
            if (itemInfo.sizes && itemInfo.sizes.length > 0 && typeof itemInfo.sizes[0] === 'object') {
              // Novo formato: encontrar preço específico do tamanho
              const sizeData = itemInfo.sizes.find(s => s.size === item);
              const itemPrice = sizeData ? sizeData.price : itemInfo.price;
              totalAmount += itemPrice * cartItems[items][item];
            } else {
              // Formato antigo: usar preço base
              totalAmount += itemInfo.price * cartItems[items][item];
            }
          } catch (error) {
            console.log("Erro ao calcular preço do item:", error);
          }
        }
      }
    }
    return totalAmount;
  };

  // Wishlist functions
  const addToWishlist = async (productId) => {
    if (!token) {
      toast.error("Please login to add to wishlist");
      return;
    }

    try {
      const response = await axios.post(backendUrl + "/api/wishlist/add", {
        productId
      });

      if (response.data.success) {
        setWishlist(prev => [...prev, productId]);
        toast.success("Added to wishlist");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await axios.post(backendUrl + "/api/wishlist/remove", {
        productId
      });

      if (response.data.success) {
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success("Removed from wishlist");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getWishlist = async () => {
    if (!token) return;
    
    try {
      // Backend espera POST em /api/wishlist/get
      const response = await axios.post(backendUrl + "/api/wishlist/get", {});
      
      if (response.data.success) {
        setWishlist(response.data.wishlist);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  // Coupon functions
  const validateCoupon = async (couponCode) => {
    if (!token) {
      toast.error("Faça login para usar cupons");
      return null;
    }

    if (!couponCode.trim()) {
      toast.error("Digite um código de cupom");
      return null;
    }

    try {
      const cartAmount = getCartAmount();
      const cartProducts = [];
      
      // Preparar dados dos produtos do carrinho para validação
      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          if (cartItems[itemId][size] > 0) {
            const product = products.find(p => p._id === itemId);
            if (product) {
              cartProducts.push({
                _id: product._id,
                category: product.category,
                price: product.price
              });
            }
          }
        }
      }

      const response = await axios.post(backendUrl + "/api/coupon/validate", {
        code: couponCode,
        orderValue: cartAmount,
        products: cartProducts
      });

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setCouponDiscount(response.data.discount);
        toast.success("Cupom aplicado com sucesso!");
        return response.data;
      } else {
        toast.error(response.data.message);
        return null;
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao validar cupom");
      return null;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    toast.info("Cupom removido");
  };

  const getActiveCoupons = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/coupon/active");
      
      if (response.data.success) {
        return response.data.coupons;
      }
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getFinalCartAmount = () => {
    const cartAmount = getCartAmount();
    return cartAmount - couponDiscount;
  };

  // Notification functions
  const getNotifications = async (page = 1, unreadOnly = false) => {
    if (!token) return;

    try {
      const userId = getUserData()?.id;
      if (!userId) return;

      const response = await axios.get(
        `${backendUrl}/api/notification/user/${userId}?page=${page}&unreadOnly=${unreadOnly}`
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadNotificationCount(response.data.pagination.unreadCount);
        return response.data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!token) return;

    try {
      const userId = getUserData()?.id;
      const response = await axios.put(
        `${backendUrl}/api/notification/read/${notificationId}`,
        { userId }
      );

      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!token) return;

    try {
      const userId = getUserData()?.id;
      const response = await axios.put(
        `${backendUrl}/api/notification/read-all`,
        { userId }
      );

      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadNotificationCount(0);
        toast.success("Todas as notificações foram marcadas como lidas");
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!token) return;

    try {
      const userId = getUserData()?.id;
      const response = await axios.delete(
        `${backendUrl}/api/notification/${notificationId}`,
        { data: { userId } }
      );

      if (response.data.success) {
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
        // Update unread count if the deleted notification was unread
        const deletedNotif = notifications.find(n => n._id === notificationId);
        if (deletedNotif && !deletedNotif.read) {
          setUnreadNotificationCount(prev => Math.max(0, prev - 1));
        }
        toast.success("Notificação excluída");
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  // Helper function to get user data from token
  const getUserData = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserCart = async () => {
    try {
      const response = await axios.post(backendUrl + "/api/cart/get", {});

      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  useEffect(() => {
    async function loadData() {
      await getProductsData();
      if (localStorage.getItem("token")) {
        await getUserCart();
        await getWishlist();
        await getNotifications();
      }
    }
    loadData();
  }, []);

  // Função para obter o valor do frete (calculado ou padrão)
  const getDeliveryFee = () => {
    if (calculatedShipping && typeof calculatedShipping === 'object') {
      return calculatedShipping.cost || 0;
    }
    return calculatedShipping || 0;
  };

  // Função para definir o frete calculado
  const setShippingCost = (shippingData) => {
    setCalculatedShipping(shippingData);
  };

  // Função para limpar o frete calculado
  const clearShippingCost = () => {
    setCalculatedShipping(null);
  };

  const value = {
    products,
    currency,
    deliveryFee: getDeliveryFee(), // Usar função que retorna frete calculado ou 0
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    token,
    setToken,
    wishlist,
    setWishlist,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    isInWishlist,
    appliedCoupon,
    couponDiscount,
    validateCoupon,
    removeCoupon,
    getActiveCoupons,
    getFinalCartAmount,
    notifications,
    unreadNotificationCount,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    calculatedShipping,
    setShippingCost,
    clearShippingCost,
    getDeliveryFee,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
