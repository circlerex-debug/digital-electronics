
import React from 'react';

interface SevenSegmentProps {
  bits: string; // 8 bits: DP G F E D C B A
  activeColor?: string;
  inactiveColor?: string;
}

const SevenSegment: React.FC<SevenSegmentProps> = ({ 
  bits, 
  activeColor = "#ef4444", 
  inactiveColor = "#e2e8f0" 
}) => {
  // bits index: 7=DP, 6=G, 5=F, 4=E, 3=D, 2=C, 1=B, 0=A
  // Assuming active high (common cathode logic for 1 = lit)
  const isLit = (idx: number) => bits[7 - idx] === '1';

  return (
    <div className="relative w-12 h-20 bg-transparent flex items-center justify-center">
      {/* Top - A */}
      <div className={`absolute top-0 w-8 h-1 rounded-full transition-colors ${isLit(0) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-200'}`} style={{ left: '50%', transform: 'translateX(-50%)' }}></div>
      
      {/* Top Left - F */}
      <div className={`absolute top-1 left-0 w-1 h-8 rounded-full transition-colors ${isLit(5) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-200'}`}></div>
      
      {/* Top Right - B */}
      <div className={`absolute top-1 right-0 w-1 h-8 rounded-full transition-colors ${isLit(1) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-200'}`}></div>
      
      {/* Middle - G */}
      <div className={`absolute w-8 h-1 rounded-full transition-colors ${isLit(6) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-200'}`} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
      
      {/* Bottom Left - E */}
      <div className={`absolute bottom-1 left-0 w-1 h-8 rounded-full transition-colors ${isLit(4) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-200'}`}></div>
      
      {/* Bottom Right - C */}
      <div className={`absolute bottom-1 right-0 w-1 h-8 rounded-full transition-colors ${isLit(2) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-200'}`}></div>
      
      {/* Bottom - D */}
      <div className={`absolute bottom-0 w-8 h-1 rounded-full transition-colors ${isLit(3) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-200'}`} style={{ left: '50%', transform: 'translateX(-50%)' }}></div>
      
      {/* DP */}
      <div className={`absolute -bottom-1 -right-2 w-2 h-2 rounded-full transition-colors ${isLit(7) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-200'}`}></div>
    </div>
  );
};

export default SevenSegment;
