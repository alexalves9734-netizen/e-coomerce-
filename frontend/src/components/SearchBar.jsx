import React, { useContext, useEffect, useRef } from "react";
import { ShopContext } from "../contexts/ShopContext";
import { assets } from "../assets/frontend_assets/assets";

const SearchBar = () => {
  const { search, showSearch, setSearch, setShowSearch } =
    useContext(ShopContext);
  const inputRef = useRef(null);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  return showSearch ? (
    <div className="border-t border-b bg-gray-50 text-center">
      <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
        <input
          ref={inputRef}
          className="flex-1 outline-none bg-inherit text-sm"
          type="text"
          placeholder="Buscar perfumes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSearch(false);
            }
          }}
        />
        <img className="w-4" src={assets.search_icon} alt="search_icon" />
      </div>
      <img
        className="inline w-3 cursor-pointer"
        onClick={() => setShowSearch(false)}
        src={assets.cross_icon}
        alt="cross_icon"
      />
    </div>
  ) : null;
};

export default SearchBar;
