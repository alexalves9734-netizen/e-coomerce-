import React, { useContext, useState } from "react";
import { assets } from "../assets/frontend_assets/assets";
import logoIfParfum from "../assets/logo-original.png";
import { NavLink, Link } from "react-router-dom";
import { ShopContext } from "../contexts/ShopContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
  } = useContext(ShopContext);

  const logout = async () => {
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between py-4 sm:py-5 px-6 sm:px-8 font-medium">
      <Link to="/" className="flex items-center lg:ml-[10vw] xl:ml-[12vw]">
        <img
          src={logoIfParfum}
          alt="IF PARFUM logo"
          className="h-[72px] sm:h-[96px] md:h-[110px] w-auto object-contain"
        />
      </Link>
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>INÍCIO</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>PERFUMES</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>SOBRE</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTATO</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/tracking" className="flex flex-col items-center gap-1">
          <p>RASTREAR</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>
      <div className="flex items-center gap-4 sm:gap-6">
        <img
          onClick={() => { setShowSearch(true); navigate('/collection'); }}
          src={assets.search_icon}
          className="w-5 sm:w-5 cursor-pointer"
          alt="search_icon"
        />
        <div className="group relative">
          <img
            onClick={() => (token ? null : navigate("/login"))}
            src={assets.profile_icon}
            className="w-5 sm:w-5 cursor-pointer"
            alt="profile_icon"
          />
          {/* Dropdown menu */}
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                {/* <p className="cursor-pointer hover:text-black">Meu Perfil</p> */}
                <p
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer hover:text-black"
                >
                  Pedidos
                </p>
                <p onClick={logout} className="cursor-pointer hover:text-black">
                  Sair
                </p>
              </div>
            </div>
          )}
        </div>
        

        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 sm:w-5 min-w-5 sm:min-w-5" alt="cart_icon" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 sm:w-4 text-center leading-4 sm:leading-4 bg-black text-white aspect-square rounded-full text-[8px] sm:text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 sm:w-5 cursor-pointer sm:hidden"
          alt="menu_icon"
        />
      </div>
      {/* Sidebar menu for small screens */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-4 cursor-pointer"
          >
            <img
              src={assets.dropdown_icon}
              className="h-5 rotate-180"
              alt="dropdown_icon"
            />
            <p className="text-base">Voltar</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-3 pl-6 border text-base"
            to="/"
          >
            INÍCIO
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-3 pl-6 border text-base"
            to="/collection"
          >
            ESSÊNCIAS
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-3 pl-6 border text-base"
            to="/about"
          >
            SOBRE
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-3 pl-6 border text-base"
            to="/contact"
          >
            CONTATO
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-3 pl-6 border text-base"
            to="/tracking"
          >
            RASTREAR
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
