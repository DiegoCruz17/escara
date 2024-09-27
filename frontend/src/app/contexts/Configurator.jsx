// contexts/Configurator.jsx
"use client"; // Ensures this file is treated as a client-side component
import { createContext, useContext, useState } from "react";

// Create the context
const ConfiguratorContext = createContext();

// Create a provider component
export function ConfiguratorProvider({ children }) {
    const [mode, setMode] = useState("directo");
    const [x, setX] = useState(18);
    const [y, setY] = useState(0);
    const [z, setZ] = useState(0);
    const [base, setBase] = useState(0);
    const [segmento1, setSegmento1] = useState(0);
    const [zAxis, setZAxis] = useState(230);
    const [segmento2, setSegmento2] = useState(-45);
    const [gripper, setGripper] = useState(90);
    const [baseMin, setBaseMin] = useState(-180);
    const [baseMax, setBaseMax] = useState(180);
    const [zMin, setZMin] = useState(100);
    const [zMax, setZMax] = useState(230);
    const [segmento1Min, setSegmento1Min] = useState(-150);
    const [segmento1Max, setSegmento1Max] = useState(150);
    const [segmento2Min, setSegmento2Min] = useState(-150);
    const [segmento2Max, setSegmento2Max] = useState(150);
    const [gripperMin, setGripperMin] = useState(0);
    const [gripperMax, setGripperMax] = useState(90);
    const [matrix, setMatrix] = useState([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
    const [matrix1, setMatrix1] = useState([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
    const [matrix2, setMatrix2] = useState([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
    const [matrix3, setMatrix3] = useState([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
    const [matrix4, setMatrix4] = useState([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);

    const attrs = {
        "x":x, 
        "setX":setX, 
        "y":y,
        "setY":setY,
        "z":z,
        "setZ":setZ,
        "mode":mode,
        "setMode":setMode,
        "base":base,
        "segmento1":segmento1,
        "segmento2":segmento2,
        "zAxis":zAxis,
        "gripper":gripper,
        "baseMin":baseMin,
        "baseMax":baseMax,
        "zMin":zMin,
        "zMax":zMax,
        "segmento1Min":segmento1Min,
        "segmento1Max":segmento1Max,
        "segmento2Min":segmento2Min,
        "segmento2Max":segmento2Max,
        "gripperMin":gripperMin,
        "gripperMax":gripperMax,
        "matrix":matrix,
        "matrix1":matrix1,
        "matrix2":matrix2,
        "matrix3":matrix3,
        "matrix4":matrix4,
        "setBase":setBase,
        "setSegmento1":setSegmento1,
        "setSegmento2":setSegmento2,
        "setZAxis":setZAxis,
        "setGripper":setGripper,
        "setBaseMin":setBaseMin,
        "setBaseMax":setBaseMax,
        "setZMin":setZMin,
        "setZMax":setZMax,
        "setSegmento1Min":setSegmento1Min,
        "setSegmento1Max":setSegmento1Max,
        "setSegmento2Min":setSegmento2Min,
        "setSegmento2Max":setSegmento2Max,
        "setGripperMin":setGripperMin,
        "setGripperMax":setGripperMax,
        "setMatrix":setMatrix,
        "setMatrix1":setMatrix1,
        "setMatrix2":setMatrix2,
        "setMatrix3":setMatrix3,
        "setMatrix4":setMatrix4
    }

    return (
        <ConfiguratorContext.Provider value={attrs}>
          {children}
        </ConfiguratorContext.Provider>
      );
}

// Create a custom hook to use the Configurator context
export const useConfigurator = () => {
    const context = useContext(ConfiguratorContext);
    if (!context) {
        throw new Error("useConfigurator must be used within a ConfiguratorProvider");
    }
    return context;
};
