import React from "react";
import { assets } from "../assets/admin_assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-2 px-[4%] justify-between">
      {/* Branding textual no lugar da logo */}
      <div className="flex flex-col leading-tight">
        <span className="text-2xl sm:text-3xl font-semibold tracking-tight">If Parfum</span>
        <span className="text-xs sm:text-sm text-gray-500">Painel Administrativo</span>
      </div>
      <button
        onClick={() => setToken("")}
        className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm"
      >
        Sair
      </button>
    </div>
  );
};

export default Navbar;
