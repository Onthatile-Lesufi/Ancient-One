import React from 'react';
import AncientOneLogo from "../assets/AncientOneLogo.png";
import ScoringsBackground from '../assets/ScoringsBackground.png';
import PlayerListBg from '../assets/PlayerListBg.png';

export default function Scorings() {
  return (
    <div 
      className="relative min-h-screen bg-cover bg-bottom font-['Jersey_25',_sans-serif] text-white p-8 overflow-hidden flex flex-col"
      style={{ backgroundImage: `url(${ScoringsBackground})` }}
    >
      
      <div className="absolute top-0 left-0 w-full h-16 bg-[#F605C6]"></div>

     
      <div className="mt-18 mx-20">
        <img 
          src={AncientOneLogo} 
          alt="Ancient One Logo" 
          className="w-124" 
        />
      </div>

     <div className="flex-1 flex items-center justify-center mt-12 w-full max-w-5xl mx-auto z-10">

        <div 
          className="w-full min-h-[250px] px-24 py-12 flex flex-col gap-8 bg-[length:100%_100%] bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${PlayerListBg})` }}
        >
          <h2 className="text-center text-5xl tracking-widest mb-4 drop-shadow-md">
            Winner
          </h2>

          <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto ">
            {[1, 2, 3].map((player) => (
              <div key={player} className="flex justify-between items-end text-3xl">
                <span className="whitespace-nowrap">Player {player}</span>

                <div className="flex-1 border-b-[4px] border-dotted border-white/50 mx-4 mb-[6px]"></div>
                <span className="w-12"></span> 
              </div>
            ))}
          </div>
          
        </div>
      </div>

      
    </div>
  );
}