import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../contexts/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Wishlist = () => {
  const { products, wishlist, removeFromWishlist, currency } = useContext(ShopContext);
  const [wishlistProducts, setWishlistProducts] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const filteredProducts = products.filter(product => 
        wishlist.includes(product._id)
      );
      setWishlistProducts(filteredProducts);
    }
  }, [products, wishlist]);

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'MY'} text2={'WISHLIST'} />
      </div>

      {wishlistProducts.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='text-6xl mb-4'>💝</div>
          <h2 className='text-2xl font-medium text-gray-700 mb-2'>Your wishlist is empty</h2>
          <p className='text-gray-500 text-center max-w-md'>
            Save your favorite items to your wishlist and never lose track of what you love!
          </p>
        </div>
      ) : (
        <>
          <p className='text-gray-600 mb-8'>
            You have {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} in your wishlist
          </p>
          
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
            {wishlistProducts.map((item, index) => (
              <div key={index} className='relative group'>
                <ProductItem 
                  id={item._id} 
                  name={item.name} 
                  price={item.price} 
                  image={item.image} 
                />
                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600'
                  title='Remove from wishlist'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;