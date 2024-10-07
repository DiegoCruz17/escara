'use client';

import React, { useState,useEffect } from 'react';
import { useConfigurator } from '../contexts/Configurator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Label } from "@/app/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { useIncrementalUpdate } from '../lib/utils';
const ScaraRobotControl = () => {
  const attrs = useConfigurator();
  const [limitsEnabled, setLimitsEnabled] = useState(false);
  const incrementalUpdate = useIncrementalUpdate();


  const resetToDefaults = () => {
    attrs.setBase(0);
    attrs.setSegmento1(0);
    attrs.setZAxis(100);
    attrs.setSegmento2(0);
    attrs.setGripper(0);
    attrs.setBaseMin(-180);
    attrs.setBaseMax(180);
    attrs.setZMin(100);
    attrs.setZMax(230);
    attrs.setSegmento1Min(-150);
    attrs.setSegmento1Max(150);
    attrs.setSegmento2Min(-150);
    attrs.setSegmento2Max(150);
    attrs.setGripperMin(0);
    attrs.setGripperMax(90);

    setLimitsEnabled(false);
  };
  // useEffect(()=>{
  const sendInstructions = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify(attrs);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/", requestOptions);
      let res = await response.json();
      console.log(res)
      if(res.setting_matrix){
        attrs.setMatrix(res.matrix);
        attrs.setMatrix1(res.matrix1);
        attrs.setMatrix2(res.matrix2);
        attrs.setMatrix3(res.matrix3);
        attrs.setMatrix4(res.matrix4); 
      }
      if(res.q1a && res.q2a && res.zAxis){
        // attrs.setBase(res.q1a)
        // attrs.setSegmento1(res.q2a)
        // attrs.setZAxis(res.zAxis)
        incrementalUpdate(attrs.base, res.q1a, attrs.setBase, 2000);
        incrementalUpdate(attrs.segmento1, res.q2a, attrs.setSegmento1, 2000);
        incrementalUpdate(attrs.zAxis, res.zAxis, attrs.setZAxis, 2000);
      }
      
    
      
    } catch (error) {
      console.error(error);
    }
  };

  

  return (
    <div className="flex flex-col gap-0 w-[100%] relative flex-grow h-full">
      <Tabs defaultValue="forward" orientation="horizontal" className="flex flex-col w-[100%] min-w-[100%] flex-grow">
        <TabsList className="flex flex-row p-0 justify-start m-0">
          <TabsTrigger onClick={()=>{attrs.setMode("directo")}} value="forward" className="font-bold">Forward</TabsTrigger>
          <TabsTrigger onClick={()=>{attrs.setMode("geometrico")}} value="inverse" className="font-bold">Inverse</TabsTrigger>
          <TabsTrigger onClick={()=>{attrs.setMode("frontal")}} value="coreo" className="font-bold">Coreo</TabsTrigger>
        </TabsList>
        <div className="flex flex-col flex-grow h-full ">
          <div className="min-w-[100%] flex-grow max-w-[800px] bg-background p-[16px]">
          <TabsContent value="forward">
            <div className='flex flex-row justify-end gap-2'>
              <input 
              type="checkbox" 
              checked={limitsEnabled}
              onChange={() => setLimitsEnabled(!limitsEnabled)}
            />
            <span>Habilitar Límites</span>
            </div>
            <ControlGroup
            limitsEnabled={limitsEnabled}
            title="Base"
            value={attrs.base}
            setValue={attrs.setBase}
            min={attrs.baseMin}
            max={attrs.baseMax}
            setMin={attrs.setBaseMin}
            setMax={attrs.setBaseMax}
            unit="°"
          />

          <ControlGroup
          limitsEnabled={limitsEnabled}
            title="Eje Z"
            value={attrs.zAxis}
            setValue={attrs.setZAxis}
            min={attrs.zMin}
            max={attrs.zMax}
            setMin={attrs.setZMin}
            setMax={attrs.setZMax}
            unit="mm"
          />

          <ControlGroup
          limitsEnabled={limitsEnabled}
            title="Segmento 1"
            value={attrs.segmento1}
            setValue={attrs.setSegmento1}
            min={attrs.segmento1Min}
            max={attrs.segmento1Max}
            setMin={attrs.setSegmento1Min}
            setMax={attrs.setSegmento1Max}
            unit="°"
          />

          <ControlGroup
          limitsEnabled={limitsEnabled}
            title="Segmento 2"
            value={attrs.segmento2}
            setValue={attrs.setSegmento2}
            min={attrs.segmento2Min}
            max={attrs.segmento2Max}
            setMin={attrs.setSegmento2Min}
            setMax={attrs.setSegmento2Max}
            unit="°"
          />

          <ControlGroup
          limitsEnabled={limitsEnabled}
            title="Gripper"
            value={attrs.gripper}
            setValue={attrs.setGripper}
            min={attrs.gripperMin}
            max={attrs.gripperMax}
            setMin={attrs.setGripperMin}
            setMax={attrs.setGripperMax}
            unit="°"
          />
              <div className="mt-8 flex justify-center space-x-4">
                <button onClick={sendInstructions} className="bg-[#5e7029] text-white font-normal py-2 px-4 rounded-[4px]">
                  Execute
                </button>
                <button onClick={resetToDefaults} className="bg-[#5e2129] text-white font-normal py-2 px-4 rounded-[4px]">
                  Reset
                </button>
              </div>
              
          </TabsContent>
          <TabsContent value="inverse">
            <RadioGroup defaultValue={attrs.mode} 
            onValueChange={(value) => {
              attrs.setMode(value);
            }} 
            className="grid grid-cols-3">
              <div className="flex items-center space-x-2 justify-center">
                <RadioGroupItem value="geometrico" id="geometrico" />
                <Label htmlFor="geometrico">Geometrico</Label>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                <RadioGroupItem value="algebraico" id="algebraico" />
                <Label htmlFor="algebraico">Algebraico</Label>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                <RadioGroupItem value="mth" id="mth" />
                <Label htmlFor="mth">MTH</Label>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                <RadioGroupItem value="newton" id="newton" />
                <Label htmlFor="newton">Newton</Label>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                <RadioGroupItem value="gradiente" id="gradiente" />
                <Label htmlFor="gradiente">Gradiente</Label>
              </div>
            </RadioGroup>
            <PositionControlGroup title={"X"} value={attrs.x} setValue={attrs.setX} min={-500} max={500} unit={"mm"}/>
            <PositionControlGroup title={"Y"} value={attrs.y} setValue={attrs.setY} min={-500} max={500} unit={"mm"}/>
            <PositionControlGroup title={"Z"} value={attrs.z} setValue={attrs.setZ} min={0} max={200} unit={"mm"}/>
            <PositionControlGroup title={"O"} value={attrs.segmento2} setValue={attrs.setSegmento2} min={-150} max={150} unit={"°"}/>
            <PositionControlGroup title={"G"} value={attrs.gripper} setValue={attrs.setGripper} min={0} max={90} unit={"°"}/>
              <div className="mt-8 flex justify-center space-x-4">
                <button onClick={sendInstructions} className="bg-[#5e7029] text-white font-normal py-2 px-4 rounded-[4px]">
                  Execute
                </button>
                <button onClick={resetToDefaults} className="bg-[#5e2129] text-white font-normal py-2 px-4 rounded-[4px]">
                  Reset
                </button>
              </div>
              

          </TabsContent>
          <TabsContent value="coreo">
            <RadioGroup defaultValue={attrs.mode} 
            onValueChange={(value) => {
              attrs.setMode(value);
            }} 
            className="flex flex-row gap-2 justify-center">
              <div className="flex items-center space-x-2 justify-center">
                <RadioGroupItem value="frontal" id="frontal" />
                <Label htmlFor="frontal">Frente</Label>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                <RadioGroupItem value="floor" id="floor" />
                <Label htmlFor="floor">Suelo</Label>
              </div>
            </RadioGroup>
              <div className="mt-8 flex justify-center space-x-4">
                <button onClick={sendInstructions} className="bg-[#5e7029] text-white font-normal py-2 px-4 rounded-[4px]">
                  Execute
                </button>
                <button onClick={resetToDefaults} className="bg-[#5e2129] text-white font-normal py-2 px-4 rounded-[4px]">
                  Reset
                </button>
              </div>
              

          </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

const ControlGroup = ({ title, value, setValue, min, max, unit, limitsEnabled,setMin, setMax }) => {

  const handleValueChange = (newValue) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    setValue(clampedValue);
  };

  return (
    <div className="space-y-2 text-black mt-[8px] m-[8px]">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-xl font-semibold text-[#000]">{title}</h2>
      </div>
      <div className="flex justify-between items-center space-x-2 text-black">
        <div className="flex items-center">
          <input 
            type="number" 
            value={min} 
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-16 p-1 border rounded"
            disabled={!limitsEnabled}
          />
          <span className="ml-1">{unit}</span>
        </div>
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value} 
          onChange={(e) => handleValueChange(Number(e.target.value))}
          className="flex-1"
        />
        <div className="flex items-center">
          <input 
            type="number" 
            value={max} 
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-16 p-1 border rounded"
            disabled={!limitsEnabled}
          />
          <span className="ml-1">{unit}</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button 
          onClick={() => handleValueChange(value - 1)}
          className="bg-[#5e2129] text-white hover:bg-gray-400 text-gray-800 font-normal py-1 px-3 rounded-[4px]"
        >
          -1
        </button>
        <div className="flex items-center">
          <input 
            type="number" 
            value={value} 
            onChange={(e) => handleValueChange(Number(e.target.value))}
            className="w-20 p-1 border rounded text-center"
          />
          <span className="ml-1">{unit}</span>
        </div>
        <button 
          onClick={() => handleValueChange(value + 1)}
          className="bg-[#5e2129] text-white hover:bg-gray-400 text-gray-800 font-normal py-1 px-3 rounded-[4px]"
        >
          +1
        </button>
      </div>
    </div>
  );
};
const PositionControlGroup = ({ title, value, setValue, min, max, unit }) => {

  const handleValueChange = (newValue) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    setValue(clampedValue);
  };

  return (
    <div className="space-y-2 text-black mt-[8px] m-[8px]">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-xl font-semibold text-[#000]">{title}</h2>
      </div>
      <div className="flex justify-between items-center space-x-2 text-black">
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value} 
          onChange={(e) => handleValueChange(Number(e.target.value))}
          className="flex-1"
        />
      </div>
      <div className="flex justify-between items-center">
        <button 
          onClick={() => handleValueChange(value - 1)}
          className="bg-[#5e2129] text-white hover:bg-gray-400 text-gray-800 font-normal py-1 px-3 rounded-[4px]"
        >
          -1
        </button>
        <div className="flex items-center">
          <input 
            type="number" 
            value={value} 
            onChange={(e) => handleValueChange(Number(e.target.value))}
            className="w-20 p-1 border rounded text-center"
          />
          <span className="ml-1">{unit}</span>
        </div>
        <button 
          onClick={() => handleValueChange(value + 1)}
          className="bg-[#5e2129] text-white hover:bg-gray-400 text-gray-800 font-normal py-1 px-3 rounded-[4px]"
        >
          +1
        </button>
      </div>
    </div>
  );
};

export default ScaraRobotControl;

