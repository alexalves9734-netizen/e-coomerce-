import React from "react";
import { assets } from "../assets/frontend_assets/assets";

const OurPolicy = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-around gap-10 sm:gap-6 text-center py-12 sm:py-20 px-6 sm:px-0 text-gray-700">
      
      {/* Política de Troca */}
      <div className="max-w-xs mx-auto">
        <img
          className="w-12 sm:w-14 m-auto mb-4"
          src={assets.exchange_icon}
          alt="exchange_icon"
        />
        <p className="font-bold text-base sm:text-lg text-gray-800">
          Política de Troca Fácil
        </p>
        <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed italic">
          “Troca garantida em casos de defeito ou erro no envio”
        </p>
      </div>

      {/* Política de Devolução */}
      <div className="max-w-xs mx-auto">
        <img
          className="w-12 sm:w-14 m-auto mb-4"
          src={assets.quality_icon}
          alt="quality_icon"
        />
        <p className="font-bold text-base sm:text-lg text-gray-800">
          Política de Devolução de 7 Dias
        </p>
        <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed italic">
          Devolução em até 7 dias para perfumes 100% originais e lacrados.
        </p>
      </div>

      {/* Suporte ao Cliente */}
      <div className="max-w-xs mx-auto">
        <img
          className="w-12 sm:w-14 m-auto mb-4"
          src={assets.support_img}
          alt="support"
        />
        <p className="font-bold text-base sm:text-lg text-gray-800">
          Melhor Suporte ao Cliente
        </p>
        <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed italic">
          Atendimento exclusivo e personalizado para cada cliente.
        </p>
      </div>
    </div>
  );
};

export default OurPolicy;
