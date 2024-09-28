'use client'
import { OrbitControls,Environment,useGLTF } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import React, { useMemo,useState,useEffect } from 'react';
import { useConfigurator } from '../contexts/Configurator';

const SCALE = 1/20

const Model = ({ url, position, name=null, rotation, onLoadCallback, scale,mat_index=11}) => {

  const { scene } = useGLTF(url);

  scene.castShadow = true;
  const mat_library = {
    0:new THREE.MeshStandardMaterial({ color: 0x989C9F, wireframe:false, roughness:0.6, metalness:1, side: THREE.DoubleSide}),
    1:new THREE.MeshStandardMaterial({ color: 0xAD9572, wireframe:false, roughness:0.6, metalness:1, side: THREE.DoubleSide}),
    2:new THREE.MeshStandardMaterial({ color: 0x9C9C9C, wireframe:false, roughness:0.6, metalness:1, side: THREE.DoubleSide}),
    3:new THREE.MeshStandardMaterial({ color: 0xA49080, wireframe:false, roughness:0.6, metalness:1, side: THREE.DoubleSide}),
    4:new THREE.MeshStandardMaterial({ color: 0x7B7D7F, wireframe:false, roughness:0.6, metalness:1, side: THREE.DoubleSide}),
    5:new THREE.MeshStandardMaterial({ color: 0xEFEADE, wireframe:false, roughness:0.6, metalness:1, side: THREE.DoubleSide}),
    6:new THREE.MeshStandardMaterial({ color: 0x585147, wireframe:false, roughness:0.6, metalness:1, side: THREE.DoubleSide}),
    7:new THREE.MeshStandardMaterial({ color: 0x62696E, wireframe:false, roughness:0.6, metalness:1, side: THREE.DoubleSide}),
    8:new THREE.MeshStandardMaterial({ color: 0x2B2F23, wireframe:false, roughness:0.2, metalness:1, side: THREE.DoubleSide}),
    9:new THREE.MeshToonMaterial({ color: 0x405461, side: THREE.DoubleSide}),
    10: new THREE.MeshToonMaterial( { color: 0x91BDDB, side: THREE.BackSide,opacity:0.9}),
    11:new THREE.MeshStandardMaterial({ color: 0x235C35, wireframe:false, roughness:1, metalness:.5, side: THREE.DoubleSide}),
  }
  const calculateDimensions = (scene) => {
    const box = new THREE.Box3().setFromObject(scene);
    return {
      width: box.max.x - box.min.x,
      height: box.max.y - box.min.y,
      depth: box.max.z - box.min.z,
    };
  };

  const modelDimensions = useMemo(() => calculateDimensions(scene), [scene]);

  // Invoke the callback with dimensions when the model is loaded
  useMemo(() => {
    onLoadCallback && onLoadCallback(modelDimensions);
  }, [onLoadCallback, modelDimensions]);

  const clonedScene = useMemo(() => {
    const clonedScene = scene.clone(true);
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        if (mat_index) {
          child.material = mat_library[mat_index];
        }
        else{
          child.material = mat_library[0];
        }
        child.geometry.castShadow = true;
        child.castShadow = true;
      }
    });
    clonedScene.castShadow = true;
  
    return clonedScene;
  }, [scene, mat_index]);
  
  // Apply material update immediately after cloning the scene
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          if(mat_index){
            child.material = mat_library[mat_index];
          }
          else{
            child.material = mat_library[0];
          }
        }
      });
    }
  }, [clonedScene, mat_index]);
  

  
  return <primitive castShadow rotation={rotation} scale={scale} object={clonedScene} position={position} name={name}/>;
};
const Glass = (props) => {

    const cageMaterialFront = new THREE.MeshBasicMaterial( { color: 0x7396ae, side: THREE.BackSide,transparent:true,opacity:0.6} );
    const cageMaterialBack = new THREE.MeshBasicMaterial( { color: 0x7396ae, side: THREE.BackSide,transparent:true,opacity:0.6} );
    const cageMaterialTop = new THREE.MeshBasicMaterial( { color: 0x7396ae, side: THREE.BackSide,transparent:true,opacity:0.6} );
    const cageMaterialBottom = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide,transparent:true,opacity:0} );
    const cageMaterialLeft = new THREE.MeshBasicMaterial( { color: 0x7396ae, side: THREE.BackSide,transparent:true,opacity:0.6} );
    const cageMaterialRight = new THREE.MeshBasicMaterial( { color: 0x7396ae, side: THREE.BackSide,transparent:true,opacity:0.6} );
    
    let cageMaterial = [cageMaterialBack,cageMaterialFront,cageMaterialTop,cageMaterialBottom,cageMaterialLeft,cageMaterialRight];
    
    return (
      <mesh material={cageMaterial}{...props}>
        <boxGeometry attach="geometry" args={[(160),50,(160)]} />
      </mesh>
    );
  };
const Plane = (props) => {
  return (
    <mesh material={new THREE.MeshStandardMaterial( { color: 0xdddddd, side: THREE.DoubleSide, wireframe:false} )} receiveShadow {...props}>
      <boxGeometry castShadow receiveShadow attach="geometry" args={[(160),10,(160)]} />
    </mesh>
  );
};

const Robot = (attrs) => {
  const [dimsSegmento, setDimsSegmento] = useState({"width": 0,"height": 0,"depth": 0});
  const [dimsSegmento2, setDimsSegmento2] = useState({"width": 0,"height": 0,"depth": 0});
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
  }
  let base = <Model key={generateRandomString(10)} url="./models/base.glb" position={[0,0,0]} scale={[SCALE,SCALE,SCALE]} name={"base"} rotation={[0, 0, 0]}/>
  let eje = <Model key={generateRandomString(10)} url="./models/eje.glb" position={[0,0,0]} scale={[SCALE,SCALE,SCALE]} name={"base"} rotation={[0, attrs.base*Math.PI/180, 0]}/>
  let segmento1 = <Model key={generateRandomString(10)} url="./models/segmento1.glb" position={[0,attrs.zAxis/25,0]} scale={[SCALE,SCALE,SCALE]} name={"base"} rotation={[0, attrs.base*Math.PI/180, 0]} onLoadCallback={setDimsSegmento}/>
  let segmento2 = <Model key={generateRandomString(10)} url="./models/segmento2.glb" position={[dimsSegmento.width/30*Math.cos(attrs.base*Math.PI/180),attrs.zAxis/25,-dimsSegmento.width/30*Math.sin(attrs.base*Math.PI/180)]} scale={[SCALE,SCALE,SCALE]} name={"base"} rotation={[0, attrs.base*Math.PI/180+attrs.segmento1*Math.PI/180,0]} onLoadCallback={setDimsSegmento2}/>
  let gripper = <Model key={generateRandomString(10)} url="./models/Gripper.glb" position={[dimsSegmento.width/30*Math.cos(attrs.base*Math.PI/180)+dimsSegmento2.width/30*Math.cos(attrs.segmento1*Math.PI/180+attrs.base*Math.PI/180),attrs.zAxis/25+3,-dimsSegmento.width/30*Math.sin(attrs.base*Math.PI/180)-dimsSegmento2.width/30*Math.sin(attrs.segmento1*Math.PI/180+attrs.base*Math.PI/180)]} scale={[SCALE/1.5, SCALE/1.5, SCALE/1.5]} name={"Gripper"} rotation={[0, attrs.segmento2*Math.PI/180-0.5*Math.PI, 0]} />;

  return (<group position={[0,0,0]}>
    {base}
    {eje}
    {segmento1}
    {segmento2}
    {gripper}
  </group>)
}
const Bottle = (attrs) => {
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
  }
  let bottle = <Model mat_index={0} key={generateRandomString(10)} url="./models/bottle.glb" position={[0,0,0]} scale={[SCALE*0.5,SCALE*0.5,SCALE*0.5]} name={"bottle"} rotation={[0, 0, 0]}/>
  return (<group
  position={[attrs.x*SCALE,attrs.z*SCALE,-attrs.y*SCALE]}>
    {bottle}
  </group>)
}

export default function ScaraSimulation (){
  const attrs = useConfigurator();
  const robot = Robot(attrs);
  const bottle = Bottle(attrs);
    return (
    <div className="flex flex-col gap-[12px] w-full">
      <div>
        <Canvas
            size={[`600px`,`400px`]}
            style={{width: `100%`, height: `350px`}}
            shadows={true} className="min-w-[600px] h-[100%] min-h-[400px] border-[2px] border-solid border-[#80808080]"
            // orthographic
            camera={{ position: [25, 35, 25] }}
            >
          <Environment files="./skybox.hdr" background />
          <ambientLight intensity={3} />
          <directionalLight castShadow={true} position={[10, 15, 10]} shadow-mapSize={[1024, 1024]} intensity={3}>
            <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} position={[100, 100, 100]}/>
          </directionalLight>
          <OrbitControls
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI * 85/ 180}
            maxDistance={120}
            target={[0,0,0]}
          />
          <Plane receiveShadow position={[0, -5, 0]} />
          <Glass position={[0, 15, 0]}/>
          {robot}
          {bottle}

        </Canvas>
      </div>
    </div>

  );
}