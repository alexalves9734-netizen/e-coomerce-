import React from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const MercadoPagoTest = () => {
  React.useEffect(() => {
    // Inicializar com uma chave de teste válida do MercadoPago
    initMercadoPago('TEST-your-public-key-here');
  }, []);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Teste Mercado Pago</h2>
      <p className="text-gray-600 mb-4">
        Para testar completamente, você precisa:
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
        <li>Chave pública válida do MercadoPago</li>
        <li>Preference ID gerado no backend</li>
        <li>Configuração do backend para processar pagamentos</li>
      </ul>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Status da Integração:</h3>
        <p className="text-blue-700 text-sm">
          ✅ SDK do MercadoPago instalado<br/>
          ✅ Componente Payment implementado<br/>
          ⚠️ Necessário configurar chaves reais para teste completo
        </p>
      </div>
    </div>
  );
};

export default MercadoPagoTest;