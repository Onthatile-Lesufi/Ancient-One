import React from 'react';
import { useLocation } from 'react-router-dom';
import AncientOneLogo from "../assets/AncientOneLogo.png";
import ScoringsBackground from '../assets/ScoringsBackground.png';
import PlayerListBg from '../assets/PlayerListBg.png';
import GoToDashButton from "../components/GoToDashButton";

export default function Scorings() {
  const location = useLocation();
  const players = location.state?.players || [];

  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div
      className="relative min-h-screen bg-cover bg-bottom font-['Jersey_25',_sans-serif] text-white p-7 overflow-hidden flex flex-col"
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

      <div className="flex-1 flex items-center justify-center my-8 w-full max-w-6xl mx-auto z-10 px-4">
        <div
          className="w-full min-h-20 py-10 px-12 md:px-32 flex flex-col justify-center bg-[length:100%_100%] bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${PlayerListBg})` }}
        >
          <h2 className="text-center text-4xl md:text-5xl tracking-widest mb-4 md:mb-8">
            {winner ? `Winner: ${winner.name}` : "Winner"}
          </h2>

          <div className="flex flex-col gap-4 md:gap-8 w-full max-w-4xl mx-auto">
            {sortedPlayers.length > 0 ? (
              sortedPlayers.map((player) => (
                <div key={player.id} className="flex justify-between items-end text-2xl md:text-3xl">
                  <span className="whitespace-nowrap" style={{ color: player.color }}>
                    ● {player.name}
                  </span>
                  <div className="flex-1 border-b-[3px] md:border-b-[4px] border-dotted border-white/50 mx-4 md:mx-6 mb-[6px]"></div>
                  <span className="w-16 text-right">{player.score} pts</span>
                </div>
              ))
            ) : (
              <p className="text-center text-xl">No player data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex justify-end mt-4 md:mt-8 pr-4 md:pr-12">
        <GoToDashButton />
      </div>
    </div>
  );
}