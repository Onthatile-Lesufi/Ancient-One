import { useState } from 'react';
import StartBtnBg from "../assets/StartBtnBg.png";
import StartBtnBgHover from "../assets/StartBtnBgHover.png"
import "../index.css";
import { useNavigate } from 'react-router-dom';

export default function StartButton() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate('/game')}
      style={{ backgroundImage: `url(${isHovered ? StartBtnBgHover : StartBtnBg})` }}
      className="bg-cover bg-center bg-no-repeat flex items-center justify-center w-[225px] aspect-[313/197] hover:cursor-pointer"
    >
      <p className="text-5xl font-jersey text-btn-text-blue m-0">
        Start
        <br/>
        Game
      </p>
    </div>
  );
}
