import React from "react";

const BrandLogo = () => {
  return (
    <div className="leading-none select-none">
      {/* Top: IF + flourishes e swoosh inferior (SVG para precisão) */}
      <svg viewBox="0 0 300 140" className="block h-[80px] sm:h-[100px]" aria-label="IF Parfum Logo">
        {/* IF em Hello Paris Serif */}
        <text
          x="150"
          y="62"
          textAnchor="middle"
          className="logo-if-serif"
          style={{ fontSize: "60px", fill: "#111" }}
        >
          IF
        </text>
        {/* Flourish superior (pequena curva acima do F) */}
        <path
          d="M168 20 C 182 10 205 28 218 20"
          stroke="#111"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Flourish médio (curva pequena à direita do F) */}
        <path
          d="M165 58 C 178 53 190 60 200 56"
          stroke="#111"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Swoosh inferior longo com leve subida à direita */}
        <path
          d="M40 92 C 80 82 120 96 170 96 C 220 96 242 92 260 88"
          stroke="#111"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Bottom: PARFUM em La Luxes Serif (ou fallback) */}
      <div className="text-center mt-3">
        <span className="logo-parfum text-base sm:text-lg tracking-[0.28em]">PARFUM</span>
      </div>
    </div>
  );
};

export default BrandLogo;