import React from 'react';
import AncientOneLogo from "../assets/AncientOneLogo.png";
import ScoringsBackground from '../assets/ScoringsBackground.png';

export default function Scorings() {
  return (
    <div 
      className="relative min-h-screen bg-cover bg-center font-['Jersey_25',_sans-serif] text-white p-8 overflow-hidden flex flex-col"
      style={{ backgroundImage: `url(${ScoringsBackground})` }}
    >
      
      <div className="absolute top-0 left-0 w-full h-16 bg-[#F605C6]"></div>

     
      <div className="mt-8">
        <img 
          src={AncientOneLogo} 
          alt="Ancient One Logo" 
          className="w-124" 
        />
      </div>

      <div className="flex-1 flex items-center justify-center mt-12 w-full max-w-4xl mx-auto z-10">
        
      </div>
    </div>
  );
}