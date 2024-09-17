import ScaraRobotControl from "./components/ScaraRobotControl";
import ScaraSimulation from "./components/ScaraSimulation";
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col justify-center">
        <img
            className="w-[200px] h-auto mt-2 border-[3px] rounded-[50%] border-[#5e2129]"
            src="./ferney.png"
            alt="Ferney"
          />
        <h3 className="font-bold mt-[8px] text-[24px] text-black text-center">Controlador SCARA</h3>
      </div>
      {/* <div className="grid grid-cols-5 min-w-[80%] mt-[16px] justify-center align-center mb-[32px]"> */}
      <div className="flex flex-row gap-[64px] min-w-[80%] w-[80%] mt-[16px] justify-center align-center mb-[32px]">
        <div className="relative flex flex-grow">
          <ScaraRobotControl/>
        </div>
        <div className="relative">
          <ScaraSimulation/>
        </div>
      </div>
    </main>
  );
}
