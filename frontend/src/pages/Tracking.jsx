import React, { useState } from "react";
import Title from "../components/Title";
import OrderTracking from "../components/OrderTracking";

const Tracking = () => {
  const [trackingCode, setTrackingCode] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setTrackingCode("");
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="border-t pt-16">
        <div className="mb-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            ← Nova Consulta
          </button>
        </div>
        <OrderTracking trackingCode={trackingCode} />
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl mb-8">
        <Title text1={"RASTREAR"} text2={"PEDIDO"} />
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-center">
            Digite o código de rastreamento
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ex: BR123456789BR"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Rastrear Pedido
            </button>
          </form>
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Onde encontrar o código:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Email de confirmação do pedido</li>
              <li>Na página "Meus Pedidos"</li>
              <li>SMS de notificação (se aplicável)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;