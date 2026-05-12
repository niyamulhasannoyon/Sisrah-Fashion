'use client';

interface ColorSwatchProps {
  colorHex: string;
  colorName: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function ColorSwatch({ colorHex, colorName, isSelected, onClick }: ColorSwatchProps) {
  return (
    <div className="relative group flex items-center justify-center">
      {/* Outer Ring for Selection State */}
      <button
        onClick={onClick}
        type="button"
        className={`w-[30px] h-[30px] rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
          isSelected ? 'border-[#1A1A1A] p-[2px]' : 'border-transparent hover:border-[#1A1A1A]/30'
        }`}
      >
        {/* Inner Color Circle */}
        <span
          className="w-full h-full rounded-full block border border-black/5 shadow-inner"
          style={{ backgroundColor: colorHex }}
        />
      </button>

      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest px-8px py-4px rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-md">
        {colorName}
        
        {/* CSS Triangle Arrow pointing down */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#1A1A1A]"></div>
      </div>
    </div>
  );
}
