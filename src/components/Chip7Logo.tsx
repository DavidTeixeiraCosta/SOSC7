import React from 'react';

interface Chip7LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Chip7Logo: React.FC<Chip7LogoProps> = ({ className = '', size = 'md' }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Microchip Graphic */}
      <div className="relative flex items-center justify-center">
        <svg
          width={isSm ? 30 : isLg ? 48 : 38}
          height={isSm ? 30 : isLg ? 48 : 38}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Pins */}
          <rect x="42" y="5" width="16" height="10" rx="2" fill="#000" />
          <rect x="42" y="85" width="16" height="10" rx="2" fill="#000" />
          <rect x="5" y="42" width="10" height="16" rx="2" fill="#000" />
          <rect x="85" y="42" width="10" height="16" rx="2" fill="#000" />

          {/* Corner pins */}
          <rect x="22" y="5" width="12" height="10" rx="2" fill="#000" />
          <rect x="66" y="5" width="12" height="10" rx="2" fill="#000" />
          <rect x="22" y="85" width="12" height="10" rx="2" fill="#000" />
          <rect x="66" y="85" width="12" height="10" rx="2" fill="#000" />

          {/* Chip Body */}
          <rect x="14" y="14" width="72" height="72" rx="10" fill="#000" stroke="#fff" strokeWidth="4" />
          <rect x="20" y="20" width="60" height="60" rx="6" fill="#ff6600" />

          {/* Golden Center & Circuit traces */}
          <circle cx="50" cy="50" r="18" fill="#ffd700" stroke="#000" strokeWidth="2.5" />
          <text
            x="50"
            y="57"
            fontFamily="Arial Black, Impact, sans-serif"
            fontSize="22"
            fontWeight="900"
            fill="#000"
            textAnchor="middle"
          >
            7
          </text>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col text-left leading-none">
        <div className="font-black tracking-tight text-black text-lg sm:text-xl font-sans flex items-baseline">
          <span>CHIP</span>
          <span className="text-white drop-shadow-[1px_1px_0px_#000] ml-0.5">7</span>
        </div>
        <div className="text-[9px] font-extrabold tracking-widest text-black/90 uppercase font-mono">
          INFORMÁTICA
        </div>
      </div>
    </div>
  );
};
