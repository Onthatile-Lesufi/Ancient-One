import PointSystemHeading from "../assets/PointSystemHeading.png"
import DinosaurEggsPoints from "../assets/DinosaurEggsPoints.png"
import BonesPoints from "../assets/BonesPoints.png"
import ClosureAndScoring from "../assets/ClosureAndScoring.png"
import ArrowDown from "../assets/ArrowDown.png";

export default function DashSection3() {
  return (
    <div className="w-full h-fit flex items-center justify-top flex-col gap-y-[90px] bg-linear-to-t to-50% from-ancient-one-pink to-ancient-one-blue min-h-dvh">
      <div className="h-[165px] aspect-[328/144] bg-cover bg-center bg-no-repeat">
        <img src={PointSystemHeading} alt="heading"/>
      </div>
      <div className="flex flex-row align-center justify-center gap-x-[150px]">
        <div className="h-[150px] aspect-[610/182] bg-cover bg-center bg-no-repeat">
            <img src={DinosaurEggsPoints} alt="heading"/>
        </div>
        <div className="h-[150px] aspect-[610/182] bg-cover bg-center bg-no-repeat">
            <img src={BonesPoints} alt="heading"/>
        </div>
      </div>
      <div className="h-[175px] aspect-[1035/220] bg-cover bg-center bg-no-repeat">
        <img src={ClosureAndScoring} alt="heading"/>
      </div>
      <div className="h-[78px] aspect-[78/75] bg-cover rotate-180 bg-center bg-no-repeat">
        <img src={ArrowDown} alt="heading"/>
      </div>
    </div>
  );
}
