import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/admin_assets/assets";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className={({ isActive }) => `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l transition-colors ${isActive ? 'active bg-orange-50 border-orange-300 text-orange-800 border-l-4 border-orange-500' : 'hover:bg-gray-50 text-gray-700'}`}
          to={"/add"}
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="add-icon" />
          <p className="hidden md:block">Adicionar Itens</p>
        </NavLink>
        <NavLink
          className={({ isActive }) => `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l transition-colors ${isActive ? 'active bg-orange-50 border-orange-300 text-orange-800 border-l-4 border-orange-500' : 'hover:bg-gray-50 text-gray-700'}`}
          to={"/list"}
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="list-icon" />
          <p className="hidden md:block">Listar Itens</p>
        </NavLink>
        <NavLink
          className={({ isActive }) => `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l transition-colors ${isActive ? 'active bg-orange-50 border-orange-300 text-orange-800 border-l-4 border-orange-500' : 'hover:bg-gray-50 text-gray-700'}`}
          to={"/orders"}
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="order-icon" />
          <p className="hidden md:block">Pedidos</p>
        </NavLink>
        <NavLink
          className={({ isActive }) => `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l transition-colors ${isActive ? 'active bg-orange-50 border-orange-300 text-orange-800 border-l-4 border-orange-500' : 'hover:bg-gray-50 text-gray-700'}`}
          to={"/deliveries"}
        >
          <img className="w-5 h-5" src={assets.parcel_icon} alt="delivery-icon" />
          <p className="hidden md:block">Entregas</p>
        </NavLink>
        <NavLink
          className={({ isActive }) => `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l transition-colors ${isActive ? 'active bg-orange-50 border-orange-300 text-orange-800 border-l-4 border-orange-500' : 'hover:bg-gray-50 text-gray-700'}`}
          to={"/freight-regions"}
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="freight-icon" />
          <p className="hidden md:block">Regiões de Frete</p>
        </NavLink>
        <NavLink
          className={({ isActive }) => `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l transition-colors ${isActive ? 'active bg-orange-50 border-orange-300 text-orange-800 border-l-4 border-orange-500' : 'hover:bg-gray-50 text-gray-700'}`}
          to={"/tracking"}
        >
          <img className="w-5 h-5" src={assets.parcel_icon} alt="tracking-icon" />
          <p className="hidden md:block">Rastreamentos</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
