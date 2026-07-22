import StartButton from "./StartButton";
import Logo from "./Logo";
import DashHeroBg from "../assets/DashHeroBg.png"
import RulesArrow from "./RulesArrow";

export default function DashSection1() {
  return (
    <div
      className="flex items-center justify-top flex-col gap-y-[90px] bg-ancient-one-blue bg-cover bg-center min-h-dvh"
      style={{ backgroundImage: `url(${DashHeroBg})` }}
    >
      <div className='flex justify-between items-center flex-col h-full gap-y-[90px] pt-15'>
        <Logo />
        <StartButton />
        <RulesArrow/>
      </div>
    </div>
  );
}
