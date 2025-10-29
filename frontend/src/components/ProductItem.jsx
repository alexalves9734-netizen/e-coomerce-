import React, { useContext } from "react";
import { ShopContext } from "../contexts/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency, addToWishlist, removeFromWishlist, isInWishlist } = useContext(ShopContext);

  const optimizeImage = (url, width = 400, quality = 'auto') => {
    try {
      if (!url) return url;
      if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
        const parts = url.split('/image/upload/');
        const transform = `f_auto,q_${quality},w_${width}`;
        return `${parts[0]}/image/upload/${transform}/${parts[1]}`;
      }
      // Unsplash or others: try to append sizing params
      if (url.includes('images.unsplash.com')) {
        const u = new URL(url);
        u.searchParams.set('w', width);
        u.searchParams.set('q', '75');
        u.searchParams.set('fit', 'crop');
        u.searchParams.set('auto', 'format');
        return u.toString();
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  return (
    <div className="relative group">
      <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
        <div className="overflow-hidden aspect-square">
          <img
            className="w-full h-full object-cover hover:scale-110 transition ease-in-out"
            src={optimizeImage(image[0], 500)}
            srcSet={`${optimizeImage(image[0], 300)} 300w, ${optimizeImage(image[0], 500)} 500w, ${optimizeImage(image[0], 800)} 800w`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            width="600"
            height="600"
            loading="lazy"
            decoding="async"
            alt="product_image"
          />
        </div>
        <p className="pt-2 sm:pt-3 pb-1 text-xs sm:text-sm truncate">{name}</p>
        <p className="text-xs sm:text-sm font-medium">
          {currency}
          {price}
        </p>
      </Link>
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-1 sm:top-2 right-1 sm:right-2 p-1 sm:p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
          isInWishlist(id) 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-white text-gray-600 hover:text-red-500 hover:bg-red-50'
        }`}
        title={isInWishlist(id) ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg 
          className="w-3 h-3 sm:w-4 sm:h-4" 
          fill={isInWishlist(id) ? "currentColor" : "none"} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      </button>
    </div>
  );
};

export default ProductItem;
