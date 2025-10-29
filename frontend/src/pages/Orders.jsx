import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../contexts/ShopContext";
import Title from "../components/Title";
import OrderTracking from "../components/OrderTracking";
import axios from "axios";

const Orders = () => {
  const { currency, backendUrl, token, products } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [showTracking, setShowTracking] = useState(false);
  const [selectedTrackingCode, setSelectedTrackingCode] = useState("");

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            // Buscar informações do produto
            const productInfo = products.find(product => product._id === item._id);
            
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["date"] = order.date;
            item["paymentMethod"] = order.paymentMethod;
            
            // Adicionar informações do produto se encontrado
            if (productInfo) {
              item["image"] = productInfo.image;
              item["name"] = productInfo.name;
              item["price"] = productInfo.price;
            } else {
              // Fallback caso o produto não seja encontrado
              item["image"] = ["/placeholder-image.jpg"];
              item["name"] = item.name || "Produto não encontrado";
              item["price"] = item.price || 0;
            }
            
            // Adicionar informações de entrega se disponíveis
            if (order.deliveryId) {
              item["deliveryId"] = order.deliveryId;
              item["trackingCode"] = order.trackingCode;
              item["shippingCost"] = order.shippingCost;
              item["deliveryType"] = order.deliveryType;
            }
            
            allOrdersItem.push(item);
          });
        });
        console.log(allOrdersItem);

        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    }
  };

  const handleTrackOrder = (trackingCode) => {
    if (trackingCode) {
      setSelectedTrackingCode(trackingCode);
      setShowTracking(true);
    } else {
      alert("Código de rastreamento não disponível para este pedido.");
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  if (showTracking) {
    return (
      <div className="border-t pt-16">
        <div className="mb-4">
          <button 
            onClick={() => setShowTracking(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            ← Voltar aos Pedidos
          </button>
        </div>
        <OrderTracking trackingCode={selectedTrackingCode} />
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MEUS"} text2={"PEDIDOS"} />
      </div>
      <div>
        {orderData.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-start gap-6 text-sm">
              <img 
                className="w-16 sm:w-20" 
                src={item.image && item.image[0] ? item.image[0] : "/placeholder-image.jpg"} 
                alt={item.name || "Produto"} 
              />
              <div>
                <p className="sm:text-base font-medium">{item.name || "Produto não encontrado"}</p>
                <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                  <p>
                    {currency}
                    {item.price || 0}
                  </p>
                  <p>Quantidade: {item.quantity || 1}</p>
                  <p>Tamanho: {item.size || "N/A"}</p>
                </div>
                <p className="mt-2">
                  Data:{" "}
                  <span className="text-gray-400">
                    {new Date(item.date).toDateString()}
                  </span>
                </p>
                <p className="mt-2">
                  Pagamento:{" "}
                  <span className="text-gray-400">{item.paymentMethod}</span>
                </p>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
              <button
                onClick={() => handleTrackOrder(item.trackingCode)}
                className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50"
              >
                {item.trackingCode ? "Rastrear Pedido" : "Sem Rastreamento"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
