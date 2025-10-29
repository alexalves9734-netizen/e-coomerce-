import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";

const Contact = () => {
  return (
    <div>
      {/* Título */}
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={"FALE"} text2={"CONOSCO"} />
      </div>
      
      {/* Subtítulo */}
      <div className="text-center my-8 px-4">
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Estamos prontos para ajudar você a encontrar o seu perfume. Fale conosco.
        </p>
      </div>

      {/* Conteúdo */}
      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <img
          className="w-full md:max-w-[480px]"
          src={assets.contact_img}
          alt="contact_img"
        />

        <div className="flex flex-col justify-center items-start gap-6 text-gray-600">
          {/* WhatsApp */}
          <p className="text-lg flex items-center gap-2">
            {/* WhatsApp logo */}
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.2 12.3c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1-.1.2-.6.7-.7.9-.1.1-.3.2-.5.1-.3-.1-1.1-.4-2-1.2-.7-.6-1.2-1.3-1.3-1.5-.1-.2 0-.4.1-.5.1-.1.2-.3.3-.4.1-.1.1-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.5-1.1-.7-1.6-.2-.5-.4-.4-.5-.4-.1 0-.3 0-.4 0-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.9 2.1 1 2.3c.1.2 1.9 3 4.5 4.1.6.3 1.1.4 1.5.5.6.2 1.1.1 1.5.1.5-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1 0-.1-.2-.2-.4-.3zM11.9 2C6.9 2 3 5.9 3 10.9c0 1.9.6 3.6 1.6 5l-1.7 5.1 5.3-1.7c1.3.7 2.8 1.1 4.4 1.1 5 0 8.9-3.9 8.9-8.9S16.9 2 11.9 2zm0 16.2c-1.5 0-2.9-.4-4.2-1.2l-.3-.2-3.1 1 1.1-3 .2-.3c-1-1.4-1.6-3.1-1.6-4.8C3.9 6.7 7.6 3 11.9 3s8 3.7 8 8-3.6 7.2-8 7.2z" />
            </svg>
            <span>WhatsApp: 
              <a 
                href="https://wa.me/5500000000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-700 font-semibold hover:underline ml-1"
              >
                Clique aqui
              </a>
            </span>
          </p>

          {/* Email */}
          <p className="text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            <span>E-mail: contato@parfumif.com</span>
          </p>

          {/* Atendimento Online */}
          <p className="text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M2.5 12h19" />
              <path d="M12 2.5a15 15 0 010 19" />
              <path d="M12 2.5a15 15 0 000 19" />
            </svg>
            <span>Atendimento Online: em todo o Brasil</span>
          </p>

          {/* Horário */}
          <p className="text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6l4 2" />
            </svg>
            <span>Horário: Segunda a Sexta, das 9h às 18h</span>
          </p>

          <div>
            <p className="font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 017.07 7.07l-1.41 1.41A5 5 0 0110 13" />
                <path d="M14 11a5 5 0 00-7.07-7.07L5.5 5.36A5 5 0 0014 11" />
              </svg>
              <span>Siga-nos:</span>
            </p>
            <div className="flex gap-2 mt-2 text-gray-700">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">Instagram</a>
              <span>|</span>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-black">TikTok</a>
              <span>|</span>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Facebook</a>
            </div>
          </div>

          {/* Botão WhatsApp */}
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold tracking-wide px-8 py-4 rounded-lg shadow-lg transition-all duration-300"
          >
            FALAR NO WHATSAPP AGORA
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
