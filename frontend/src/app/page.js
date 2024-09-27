import ScaraRobotControl from "./components/ScaraRobotControl";
import ScaraSimulation from "./components/ScaraSimulation";
import MTH from "./components/MTH";
import Joystick from "./components/Joystick";
export default function Home() {
  return (
    <main className="grid grid-cols-12 bg-gray-100 min-h-lvh">
      <div className="relative flex flex-grow h-full col-span-4">
        <ScaraRobotControl/>
      </div>
      <div className="h-full relative flex flex-col  col-span-3 justify-between bg-white">
        <MTH/>
        <Joystick/>
      </div>
      <div className="flex flex-col justify-start col-span-5 items-center">
        <div className="relative w-full">
          <ScaraSimulation/>
        </div>
        <div className="flex flex-col items-center flex-grow justify-center">
          <img
              className="w-[50%] h-auto mt-2 border-[3px] rounded-[50%] border-[#5e2129]"
              src="./ferney.png"
              alt="Ferney"
            />
          <h3 className="font-bold mt-[8px] text-[24px] text-black text-center">Controlador SCARA</h3>

        </div>
      </div>
    </main>
  );
}
