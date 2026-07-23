import { useState } from 'react';
import BackDashBtnBg from "../assets/BackDashBtnBg.png";
import BackDashBtnHoverBg from "../assets/BackDashBtnHoverBg.png";
import "../index.css";

export default function GoToDashButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}

      style={{ backgroundImage: `url(${isHovered ? BackDashBtnHoverBg : BackDashBtnBg})` }}
      className="w-[280px] md:w-[350px] aspect-[511/131] bg-[length:100%_100%] bg-center bg-no-repeat flex items-center justify-center hover:cursor-pointer transition-all duration-200"
    >

      <p className="text-2xl md:text-3xl font-jersey text-btn-text-blue drop-shadow-md">
        Go to Dashboard
      </p>
    </div>
  );
}
