import React, { useContext } from "react";
import { ShopContext } from "../contexts/ShopContext";
import Title from "./Title";

const CartTotal = () => {
  const { 
    currency, 
    deliveryFee, 
    getCartAmount, 
    getFinalCartAmount, 
    couponDiscount, 
    appliedCoupon,
    calculatedShipping
  } = useContext(ShopContext);

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"CARRINHO"} text2={"TOTAIS"} />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm ">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {currency}
            {getCartAmount()}.00
          </p>
        </div>
        <hr className="border-gray-200" />
        {couponDiscount > 0 && (
          <>
            <div className="flex justify-between text-green-600">
              <p>Desconto ({appliedCoupon?.code})</p>
              <p>
                -{currency}
                {couponDiscount.toFixed(2)}
              </p>
            </div>
            <hr className="border-gray-200" />
          </>
        )}
        <div>
          <div className="flex justify-between">
            <p>Taxa de Entrega</p>
            <p>
              {/* Só mostrar valor de frete se foi calculado */}
              {calculatedShipping ? (
                deliveryFee === 0 ? (
                  <span className="text-green-600 font-medium">Grátis</span>
                ) : (
                  `${currency}${deliveryFee.toFixed(2)}`
                )
              ) : (
                <span className="text-gray-500 text-xs">Calcule o frete</span>
              )}
            </p>
          </div>
        </div>
        <hr className="border-gray-200" />
        <div>
          <div className="flex justify-between">
            <b>Total</b>
            <b>
              {currency}
              {getCartAmount() === 0 ? 0 : calculatedShipping ? (getFinalCartAmount() + deliveryFee).toFixed(2) : `${getFinalCartAmount().toFixed(2)} + frete`}
            </b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
