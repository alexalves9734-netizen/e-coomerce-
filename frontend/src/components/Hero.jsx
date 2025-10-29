import React from "react";
import { assets } from "../assets/frontend_assets/assets";

const Hero = () => {
  return (
    <div className="flex flex-col sm:flex-row border border-gray-400">
      {/* Hero left side */}
      <div className="w-full sm:w-1/2 flex items-center justify-center py-8 sm:py-10 px-4 sm:px-0">
        <div className="text-[#414141] text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <p className="w-6 sm:w-8 md:w-11 h-[2px] bg-[#414141]"></p>
            <p className="font-medium text-xs sm:text-sm md:text-base">SEU PERFUME, SUA IDENTIDADE</p>
          </div>
          <h1 className="py-2 sm:py-3 leading-relaxed">
            <span className="hero-if">If</span>
            <span className="hero-parfum">PARFUM</span>
          </h1>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <p className="font-semibold text-xs sm:text-sm md:text-base">GARANTA O SEU</p>
            <p className="w-6 sm:w-8 md:w-11 h-[2px] bg-[#414141]"></p>
          </div>
        </div>
      </div>
      {/* Hero right side */}
      <img className="w-full sm:w-1/2 object-cover max-h-64 sm:max-h-none" src={assets.hero_img} alt="hero_img" />
    </div>
  );
};

export default Hero;
