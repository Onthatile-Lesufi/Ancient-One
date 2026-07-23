import DashSection1 from "../components/DashSection1";
import TopBar from "../components/TopBar";
import DashSection2 from "../components/DashSection2";
import DashSection3 from "../components/DashSection3";

export default function Dashboard() {
  return (
    <div>
      <TopBar />
      <DashSection1 />
      <DashSection2/>
      <DashSection3/>
    </div>
  );
}
