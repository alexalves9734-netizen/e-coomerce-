import React, { useState } from "react";
import { assets } from "../assets/frontend_assets/assets";
import logoNavbar from "../assets/logo-original.png";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert("Obrigado por se inscrever! Você receberá seu desconto de 10% em breve.");
      setEmail("");
    }
  };

  return (
    <div className="bg-gray-50 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          
          {/* Newsletter Section */}
          <div className="space-y-6 md:col-span-1">
            <img src={logoNavbar} className="w-28 sm:w-32" alt="IF PARFUM logo" />
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight">
                Ganhe 10% OFF na sua primeira compra!
              </h3>
              <p className="text-sm text-gray-600">
                Cadastre-se e receba novidades, lançamentos e promoções exclusivas — em primeira mão, como um verdadeiro amante da perfumaria.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
                >
                  Quero Receber!
                </button>
              </form>
            </div>
          </div>

          {/* Company Section - Políticas */}
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">If Parfum</h3>
            <div className="space-y-4">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                <span className="font-medium">Comprometimento, exclusividade e autenticidade.</span>
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">✔️ Troca garantida em casos de defeito ou erro no envio.</p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">✔️ Devolução em até 7 dias para perfumes 100% originais e lacrados.</p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">✔️ Atendimento exclusivo e personalizado para cada cliente.</p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">✔️ Perfumes importados e árabes selecionados, de altíssima qualidade.</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">ENTRE EM CONTATO</h3>
            <div className="space-y-4">
              <a 
                href="https://wa.me/5541997112252" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-gray-600 hover:text-green-600 transition-colors group"
              >
                <div className="font-medium text-sm sm:text-base">WhatsApp</div>
                <div className="text-xs sm:text-sm text-gray-500 group-hover:text-green-500">41 99711-2252</div>
              </a>
              
              <div className="text-gray-600">
                <div className="font-medium text-sm sm:text-base">Email</div>
                <div className="text-xs sm:text-sm text-gray-500">contato@ifparfum.com</div>
              </div>
              
              <a 
                href="https://www.instagram.com/if_parfum_?igsh=MTI1d3docDlneHU2eg%3D%3D&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-gray-600 hover:text-pink-600 transition-colors group"
              >
                <div className="font-medium text-sm sm:text-base">Instagram</div>
                <div className="text-xs sm:text-sm text-gray-500 group-hover:text-pink-500">@if_parfum_</div>
              </a>
            </div>
          </div>
        </div>

        {/* Trust Seal & Final Phrase */}
        <div className="mt-8">
          <div className="flex items-center justify-center gap-3 text-sm text-gray-700">
            <img src={assets.quality_icon} alt="seguranca" className="w-5 h-5" />
            <span className="font-medium">Compra 100% segura</span>
            <span className="text-gray-300">•</span>
            <span className="font-medium">Envios com seguro para todo o Brasil</span>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-center text-gray-600">
            If Parfum — o luxo da perfumaria importada e árabe, agora ao seu alcance.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-center text-gray-500">
            Copyright 2024 © If Parfum - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
