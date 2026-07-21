import { useState } from 'react';
import StartBtnBg from "../assets/StartBtnBg.png";
import StartBtnBgHover from "../assets/StartBtnBgHover.png"
import "../index.css";

export default function StartButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}

      style={{ backgroundImage: `url(${isHovered ? StartBtnBgHover : StartBtnBg})` }}
      className="bg-cover bg-center bg-no-repeat flex items-center justify-center h-[197px] w-[313px] hover:cursor-pointer"
    >
      <p className="text-5xl font-jersey text-btn-text-blue">
        Start
        <br />
        Game
      </p>
    </div>
  );
}
