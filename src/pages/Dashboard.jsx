import StartButton from "../components/StartButton";
import Logo from "../components/Logo";
import TopBar from "../components/TopBar";

export default function Dashboard() {
  return (
    <div className="flex items-center justify-center flex-col gap-y-[50px]">
      <TopBar />
      <div className='flex items-center justify-center flex-col gap-y-[90px]'>
        <Logo />
        <StartButton />
      </div>
    </div>
  );
}
