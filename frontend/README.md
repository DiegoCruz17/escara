```
import { useConfigurator } from "../contexts/Configurator"
import { OrbitControls,Environment,useGLTF } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import React, { useMemo,useState,useEffect } from 'react';

const SCALE = 3.28084;
const THRASH = [100000,100000,100000];

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
      <boxGeometry attach="geometry" args={[(62+90)/SCALE,30/SCALE,(62+90)/SCALE]} />
    </mesh>
  );
};
const Plane = (props) => {
  return (
    <mesh material={new THREE.MeshStandardMaterial( { color: 0xdddddd, side: THREE.DoubleSide, wireframe:false} )} receiveShadow {...props}>
      <boxGeometry castShadow receiveShadow attach="geometry" args={[(62+90)/SCALE,10/SCALE,(62+90)/SCALE]} />
    </mesh>
  );
};

const Model = ({ url, position, name=null, rotation, onLoadCallback, scale,mat_index=null}) => {

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
    11:new THREE.MeshStandardMaterial({ color: 0xFDFDFD, wireframe:false, roughness:.8, metalness:.2, side: THREE.DoubleSide}),
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

const buildLattice = (attrs,pos=[0,0,-attrs.projection/(2*SCALE)],limit=90) => {

  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
  }
  const [colDims, setColDims] = useState({"width": 0,"height": 0,"depth": 0});
  const [rafterDims, setRafterDims] = useState({"width":0,"height":0,"depth":0});
  const [beamDims, setBeamDims] = useState({"width":0,"height":0,"depth":0});
  const [latticeDims, setLatticeDims] = useState({"width":0,"height":0,"depth":0});
  const [panelDims, setPanelDims] = useState({"width":0,"height":0,"depth":0});
  const [rafterEndDims, setRafterEndDims] = useState({"width":0,"height":0,"depth":0});
  const [beamEndDims, setBeamEndDims] = useState({"width":0,"height":0,"depth":0});
  
  const ends = ["./models/beveled.glb","./models/mitered.glb","./models/corbel.glb","./models/scallop.glb"]
  
  const cageMaterialFront = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  const cageMaterialBack = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  const cageMaterialTop = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  const cageMaterialBottom = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide,transparent:true,opacity:0} );
  const cageMaterialLeft = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  const cageMaterialRight = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  let cageMaterial = [cageMaterialBack,cageMaterialFront,cageMaterialTop,cageMaterialBottom,cageMaterialLeft,cageMaterialRight];
  const rafterSize = attrs.rafterSize/12;
  let columns = [];
  let posts = [];
  posts.push(<Model key={generateRandomString(10)} url="./models/lattice_column.glb" position={THRASH} name={"column"} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setColDims}/>)
  let width = attrs.width/SCALE;
  let projection = attrs.projection/SCALE;
  let height = attrs.height/SCALE;
  var numberOfColumns = 2;
  if(width>=limit/SCALE){
    width=limit/SCALE;
  }
  if(limit==90){
    if(width <= 22/SCALE){
      numberOfColumns = 2;
    }
    else if(width <= 34/SCALE){
      numberOfColumns = 3;
    }
    else if(width <= 45/SCALE){
      numberOfColumns = 4;
    }
    else if(width <= 56/SCALE){
      numberOfColumns = 5;
    }
    else if(width <= 68/SCALE){
      numberOfColumns = 6;
    }
    else if(width <= 79/SCALE){
      numberOfColumns = 7;
    }
    else if(width <= 90/SCALE){
      numberOfColumns = 8;
    }
  }
  else{
    if(width <= 22/SCALE){
      numberOfColumns = 2;
    }
    else if(width <= 34/SCALE){
      numberOfColumns = 3;
    }
    else if(width <= 45/SCALE){
      numberOfColumns = 4;
    }
    else{
      numberOfColumns = 4;
    }
  }
// ---------------------------COLS---------------------------------
  const colHeightScale = colDims.height!=0 ? height / colDims.height : 1/8*(attrs.height-12)+1.5;
  if(attrs.mountMode!=3){
    for (let i = 0; i < numberOfColumns; i++) {
      const position = [i * ((width-colDims.width)/(numberOfColumns-1)) - width/2 +colDims.width/2, 0, projection];
      columns.push(<Model key={i} url="./models/lattice_column.glb"position={position} name={"column"} rotation={[0, Math.PI / 2, 0]} scale={[1, colHeightScale,1]} mat_index={[attrs.materials['cover']]}/>);
      posts.push(<Model key={i} url="./models/lattice_post.glb" position={position} name={"post"} rotation={[0, Math.PI / 2, 0]} scale={[1, colHeightScale,1]} mat_index={[attrs.materials['post']]}/>);
    }
  }
  else{
    columns = [];
    posts = [];
      for (let i = 0; i < numberOfColumns; i++) {
        for(let n=0;n<2;n++){
        const position = [i * ((width-colDims.width)/(numberOfColumns-1)) - width/2 +colDims.width/2, 0, (projection-colDims.width)*n+colDims.width/2];
        columns.push(<Model key={generateRandomString(i+5)} url="./models/lattice_column.glb"position={position} name={"column"} rotation={[0, Math.PI / 2, 0]} scale={[1, colHeightScale,1]} mat_index={[attrs.materials['cover']]}/>);
        posts.push(<Model key={generateRandomString(i+5)} url="./models/lattice_post.glb" position={position} name={"post"} rotation={[0, Math.PI / 2, 0]} scale={[1, colHeightScale,1]} mat_index={[attrs.materials['post']]}/>);
        columns.push(<mesh key={generateRandomString(i+5)} material={cageMaterial} receiveShadow={true} castShadow={true} position={[i * ((width-colDims.width)/(numberOfColumns-1)) - width/2 +colDims.width/2, 0, (projection-colDims.width)*n+colDims.width/2]}>
        <boxGeometry attach="geometry" args={[2/SCALE,0.5/SCALE,2/SCALE]} />
      </mesh>)
      }
    }
  }
// ---------------------------END COLS---------------------------------
  
// ---------------------------BEAMS---------------------------------
const beams = [];
const beamEnds = []; 
beams.push(<Model key={generateRandomString(10)} url=".\models\lattice_beam.glb"position={THRASH} name={"beam"} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setBeamDims}/>)
beamEnds.push(<Model key={generateRandomString(10)} url={ends[attrs.selectedEnd]} position={THRASH} name={"beam"} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setBeamEndDims}/>)

const beamWidthScale = beamDims ? width / beamDims.depth : 1;
if(attrs.mountMode!=3){
  if(!attrs.selectedHead){
    for (let i = 0; i < 1; i++) {
      const position = [0, height-beamDims.height/2,projection];
      beams.push(<Model key={i} url=".\models\lattice_beam.glb"position={position} name={"beam"} rotation={[0, Math.PI / 2, 0]} scale={[1,1, beamWidthScale+0.3/SCALE]} mat_index={[attrs.materials['beam']]}/>);
    }
    const beamEnd1Position = [0.5*width+0.5/SCALE, height-beamDims.height/2,projection];
    const beamEnd2Position = [-0.5*width-0.5/SCALE, height-beamDims.height/2,projection];
    beamEnds.push(<Model key={0} url={ends[attrs.selectedEnd]}position={beamEnd1Position} name={"beam"} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);
    beamEnds.push(<Model key={1} url={ends[attrs.selectedEnd]}position={beamEnd2Position} name={"beam"} rotation={[0,Math.PI,0]} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);
  }
  else{
    for(let n = 0; n<2;n++){
      for (let i = 0; i < 1; i++) {
        const position = [0, height-beamDims.height/2,(projection)-0.5*colDims.width+n*colDims.width];
        beams.push(<Model key={generateRandomString(5)} url=".\models\lattice_beam.glb"position={position} name={"beam"} rotation={[0, Math.PI / 2, 0]} scale={[1,1,beamWidthScale+0.3/SCALE]} mat_index={[attrs.materials['beam']]}/>);
      }
      const beamEnd1Position = [0.5*width+0.5/SCALE, height-beamDims.height/2,(projection)-0.5*colDims.width+n*colDims.width];
      const beamEnd2Position = [-0.5*width-0.5/SCALE, height-beamDims.height/2,(projection)-0.5*colDims.width+n*colDims.width];
      beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd1Position} name={"beam"} mat_index={[attrs.materials['beam']]} scale={[1,1,1]}/>);
      beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd2Position} name={"beam"} rotation={[0,Math.PI,0]} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);

    }
  }
  
}
else{
  if(!attrs.selectedHead){
    for(let n=0;n<2;n++){
      for (let i = 0; i < 1; i++) {
        const position = [0, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width/2];
        beams.push(<Model key={generateRandomString(5)} url=".\models\lattice_beam.glb"position={position} name={"beam"} rotation={[0, Math.PI / 2, 0]} scale={[1,1, beamWidthScale+0.3/SCALE]} mat_index={[attrs.materials['beam']]}/>);
      }
      const beamEnd1Position = [0.5*width+0.5/SCALE, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width/2];
      const beamEnd2Position = [-0.5*width-0.5/SCALE, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width/2];
      beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd1Position} name={"beam"} mat_index={[attrs.materials['beam']]} scale={[1,1,1]}/>);
      beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd2Position} name={"beam"} rotation={[0,Math.PI,0]} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);
    }
  }
  else{
    for(let n = 0; n<2;n++){
      for (let i = 0; i < 2; i++) {
        const position = [0,height-beamDims.height/2,(projection-colDims.width)*n+colDims.width*i];
        beams.push(<Model key={generateRandomString(5)} url=".\models\lattice_beam.glb"position={position} name={"beam"} rotation={[0, Math.PI / 2, 0]} scale={[1,1,beamWidthScale+0.3/SCALE]} mat_index={[attrs.materials['beam']]}/>);
        const beamEnd1Position = [0.5*width+0.5/SCALE, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width*i];
        const beamEnd2Position = [-0.5*width-0.5/SCALE, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width*i];
        beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd1Position} name={"beam"} scale={[1,1,1]}/>);
        beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd2Position} name={"beam"} rotation={[0,Math.PI,0]} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);
      }
    }
  }
}
// ---------------------------END BEAMS---------------------------------
// ---------------------------RAFTERS---------------------------------
const rafters = [];
const rafterEnds = [];
rafters.push(<Model key={generateRandomString(10)} url=".\models\lattice_one_sided_beam.glb"position={THRASH} name={"rafter"} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setRafterDims}/>)
rafterEnds.push(<Model key={generateRandomString(10)} url={ends[attrs.selectedRafterEndCaps]} position={THRASH} name={"rafter"} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setRafterEndDims}/>)

const spacingBeams = 2.5/SCALE;

const rafterProjectionScale = rafterDims ? (projection) / rafterDims.width : 1;
let numberOfBeams = Math.floor(width/spacingBeams);
if(attrs.mountMode!=3){
  for (let i = 0; i <= numberOfBeams; i++) {
    const position = [i*((width-4*rafterDims.depth)/numberOfBeams)-width/2+2*rafterDims.depth, height+rafterDims.height/2,projection/2+0.4/SCALE];
    rafters.push(<Model key={i} url=".\models\lattice_one_sided_beam.glb"position={position} name={"rafter"} rotation={[0, Math.PI / 2, 0]} scale={[rafterProjectionScale+0.4/SCALE, 1,1]} mat_index={[attrs.materials['rafter']]}/>);
    const rafterEnd1Position = [i*((width-4*rafterDims.depth)/numberOfBeams)-width/2+2*rafterDims.depth, height+rafterDims.height/2,projection+1/SCALE];
    rafterEnds.push(<Model key={i} url={ends[attrs.selectedRafterEndCaps]}position={rafterEnd1Position} name={"rafter"} rotation={[0, -Math.PI / 2, 0]} scale={[1,1,1]} mat_index={[attrs.materials['rafter']]}/>);
  }
}
else{
  for (let i = 0; i <= numberOfBeams; i++) {
    const position = [i*((width-4*rafterDims.depth)/numberOfBeams)-width/2+2*rafterDims.depth, height+rafterDims.height/2,projection/2];
    rafters.push(<Model key={generateRandomString(5)} url=".\models\lattice_one_sided_beam.glb"position={position} name={"rafter"} rotation={[0, Math.PI / 2, 0]} scale={[rafterProjectionScale+0.5/SCALE, 1,1]} mat_index={[attrs.materials['rafter']]}/>);
    for(let n=0;n<2;n++){
      const rafterEnd1Position = [i*((width-4*rafterDims.depth)/numberOfBeams)-width/2+2*rafterDims.depth, height+rafterDims.height/2,n*(projection+1/SCALE)-0.5/SCALE];
      rafterEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedRafterEndCaps]}position={rafterEnd1Position} name={"rafter"} rotation={[0, n*2*-Math.PI / 2+Math.PI/2, 0]} scale={[1,1,1]} mat_index={[attrs.materials['rafter']]}/>);
    }
  }

}
// ---------------------------END RAFTERS---------------------------------

// ---------------------------LATTICES---------------------------------
const lattices = [];
lattices.push(<Model key={generateRandomString(10)} url=".\models\lattice_rafter.glb" position={THRASH} name={"lattice"} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setLatticeDims}/>)

const spacingRafters = rafterSize;
const latticeWidthScale = latticeDims ? width / latticeDims.depth : 1;
if(attrs.mountMode!=3){
  let numberOfRafters = Math.floor((attrs.projection)/(rafterSize+2/12)-1);
  for (let i = 0; i <= numberOfRafters; i++) {
    const position = [0, height+beamDims.height+latticeDims.height*0.5,i*((projection+1.5/SCALE-latticeDims.width/2)/numberOfRafters)];
    lattices.push(<Model key={i} url=".\models\lattice_rafter.glb" position={position} name={"lattice"} rotation={[0, Math.PI / 2, 0]} scale={[1,1,latticeWidthScale]} mat_index={[attrs.materials['option']]}/>);
  }
}
else{
  let numberOfRafters = Math.floor((attrs.projection)/(rafterSize+2/12)-1);
  for (let i = 0; i <= numberOfRafters; i++) {
    const position = [0, height+beamDims.height+latticeDims.height*0.5,i*((projection+2/SCALE)/numberOfRafters)-(1/SCALE)];
    lattices.push(<Model key={i} url=".\models\lattice_rafter.glb" position={position} name={"lattice"} rotation={[0, Math.PI / 2, 0]} scale={[1,1,latticeWidthScale]} mat_index={[attrs.materials['option']]}/>);
  }

}
// ---------------------------END LATTICES---------------------------------
let cbs =  null;
if(attrs.mountMode!=3){
  if(attrs.mountMode==0){
    cbs = (
      <mesh material={cageMaterial} receiveShadow={true} castShadow={true} position={[0,attrs.height/(2*SCALE),-1.2/SCALE]}>
        <boxGeometry attach="geometry" args={[width,height+beamDims.height+2*rafterDims.height+1/SCALE,2/SCALE]} />
      </mesh>
    );
  }
  else if(attrs.mountMode==1){
    cbs = (
      <mesh material={cageMaterial} receiveShadow={true} castShadow={true} position={[0,attrs.height/(2*SCALE),-1.2/SCALE]}>
        <boxGeometry attach="geometry" args={[width,height+beamDims.height+2*rafterDims.height,2/SCALE]} />
      </mesh>
    );
  }
  else{
    cbs = (
      <mesh material={cageMaterial} receiveShadow={true} castShadow={true} position={[0,attrs.height/(2*SCALE),0]}>
        <boxGeometry attach="geometry" args={[width,height,2/SCALE]} />
      </mesh>
    );
  }
}
else{
  cbs = null
}
return (<group position={pos}>
    {columns}
    {posts}
    {rafterEnds}
    {rafters}
    {beamEnds}
    {beams}
    {lattices}
    {cbs}
  </group>)
  
}

const buildInsulated = (attrs,pos=[0,0,-attrs.projection/(2*SCALE)],limit=90) => {

  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
  }
  const [colDims, setColDims] = useState({"width": 0,"height": 0,"depth": 0});
  const [rafterDims, setRafterDims] = useState({"width":0,"height":0,"depth":0});
  const [beamDims, setBeamDims] = useState({"width":0,"height":0,"depth":0});
  const [latticeDims, setLatticeDims] = useState({"width":0,"height":0,"depth":0});
  const [panelDims, setPanelDims] = useState({"width":0,"height":0,"depth":0});
  const [rafterEndDims, setRafterEndDims] = useState({"width":0,"height":0,"depth":0});
  const [beamEndDims, setBeamEndDims] = useState({"width":0,"height":0,"depth":0});
  const [limiterDims, setLimiterDims] = useState({"width":0,"height":0,"depth":0});
  
  const ends = ["./models/beveled.glb","./models/mitered.glb","./models/corbel.glb","./models/scallop.glb"]
  
  const cageMaterialFront = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  const cageMaterialBack = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  const cageMaterialTop = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  const cageMaterialBottom = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide,transparent:true,opacity:0} );
  const cageMaterialLeft = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  const cageMaterialRight = new THREE.MeshBasicMaterial( { color: 0xd0d0d0, side: THREE.DoubleSide,transparent:true,opacity:0.25});
  let cageMaterial = [cageMaterialBack,cageMaterialFront,cageMaterialTop,cageMaterialBottom,cageMaterialLeft,cageMaterialRight];
  const rafterSize = attrs.rafterSize*0.125/SCALE;
  let columns = [];
  let posts = [];
  posts.push(<Model key={generateRandomString(10)} url="./models/lattice_column.glb" position={THRASH} name={"column"} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setColDims}/>)
  let width = attrs.width/SCALE;
  let projection = attrs.projection/SCALE;
  let height = attrs.height/SCALE;
  let insulateds_limit = projection+1/SCALE-beamDims.width/2;


  var numberOfColumns = 2;
  if(width>=limit/SCALE){
    width=limit/SCALE;
  }
  if(limit==90){
    if(width <= 22/SCALE){
      numberOfColumns = 2;
    }
    else if(width <= 34/SCALE){
      numberOfColumns = 3;
    }
    else if(width <= 45/SCALE){
      numberOfColumns = 4;
    }
    else if(width <= 56/SCALE){
      numberOfColumns = 5;
    }
    else if(width <= 68/SCALE){
      numberOfColumns = 6;
    }
    else if(width <= 79/SCALE){
      numberOfColumns = 7;
    }
    else if(width <= 90/SCALE){
      numberOfColumns = 8;
    }
  }
  else{
    if(width <= 22/SCALE){
      numberOfColumns = 2;
    }
    else if(width <= 34/SCALE){
      numberOfColumns = 3;
    }
    else if(width <= 45/SCALE){
      numberOfColumns = 4;
    }
    else{
      numberOfColumns = 4;
    }
  }
// ---------------------------COLS---------------------------------
const colHeightScale = colDims.height!=0 ? height / colDims.height : 1/8*(attrs.height-12)+1.5;
const colHeightScale2 = colDims.height!=0 ? height / (1.025*colDims.height) : 1/8*(attrs.height-12)+1;
const sep = (width-colDims.width-1.4/SCALE)/(numberOfColumns-1)
if(attrs.mountMode!=3){
    for (let i = 0; i < numberOfColumns; i++) {
      const position = [i * (sep) +0.7/SCALE - width/2 + colDims.width/2, 0, projection];
      columns.push(<Model key={i} url="./models/lattice_column.glb"position={position} name={"column"} rotation={[0, Math.PI / 2, 0]} scale={[1, colHeightScale,1]} mat_index={[attrs.materials['cover']]}/>);
      posts.push(<Model key={i} url="./models/lattice_post.glb" position={position} name={"post"} rotation={[0, Math.PI / 2, 0]} scale={[1, colHeightScale,1]} mat_index={[attrs.materials['post']]}/>);
    }
    const gutterPosition = [- width/2 +colDims.width/2 + 0.7/SCALE, 0, projection];
    columns.push(<Model key={generateRandomString(8)} url="./models/gutter.glb"position={gutterPosition} name={"column"} rotation={[0, Math.PI, 0]} scale={[1, colHeightScale2,1]} mat_index={[attrs.materials['cover']]}/>);
  }
  else{
    columns = [];
    posts = [];
      for (let i = 0; i < numberOfColumns; i++) {
        for(let n=0;n<2;n++){
        const position = [i * (sep) +0.7/SCALE - width/2 + colDims.width/2, 0, (projection-colDims.width)*n+colDims.width/2];
        columns.push(<Model key={generateRandomString(i+5)} url="./models/lattice_column.glb"position={position} name={"column"} rotation={[0, Math.PI / 2, 0]} scale={[1, colHeightScale,1]} mat_index={[attrs.materials['cover']]}/>);
        posts.push(<Model key={generateRandomString(i+5)} url="./models/lattice_post.glb" position={position} name={"post"} rotation={[0, Math.PI / 2, 0]} scale={[1, colHeightScale,1]} mat_index={[attrs.materials['post']]}/>);
        columns.push(<mesh key={generateRandomString(i+5)} material={cageMaterial} receiveShadow={true} castShadow={true} position={[i * (sep) +0.7/SCALE - width/2 + colDims.width/2, 0, (projection-colDims.width)*n+colDims.width/2]}>
        <boxGeometry attach="geometry" args={[2/SCALE,0.5/SCALE,2/SCALE]} />
      </mesh>)
      }
    }
  }
// ---------------------------END COLS---------------------------------
  
// ---------------------------BEAMS---------------------------------
const beams = [];
const beamEnds = []; 
beams.push(<Model key={generateRandomString(10)} url=".\models\lattice_beam.glb"position={THRASH} name={"beam"} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setBeamDims}/>)
beamEnds.push(<Model key={generateRandomString(10)} url={ends[attrs.selectedEnd]} position={THRASH} name={"beam"} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setBeamEndDims}/>)

const beamWidthScale = beamDims ? (width - 1/SCALE) / beamDims.depth : 1;
if(attrs.mountMode!=3){
  if(!attrs.selectedHead){
    for (let i = 0; i < 1; i++) {
      const position = [0, height-beamDims.height/2,projection];
      beams.push(<Model key={i} url=".\models\lattice_beam.glb"position={position} name={"beam"} rotation={[0, Math.PI / 2, 0]} scale={[1,1, beamWidthScale]} mat_index={[attrs.materials['beam']]}/>);
    }
    const beamEnd1Position = [0.5*width-.5/SCALE, height-beamDims.height/2,projection];
    const beamEnd2Position = [-0.5*width+.5/SCALE, height-beamDims.height/2,projection];
    beamEnds.push(<Model key={0} url={ends[attrs.selectedEnd]}position={beamEnd1Position} name={"beam"} scale={[1,1,1]}mat_index={[attrs.materials['beam']]}/>);
    beamEnds.push(<Model key={1} url={ends[attrs.selectedEnd]}position={beamEnd2Position} name={"beam"} rotation={[0,Math.PI,0]} scale={[1,1,1]}mat_index={[attrs.materials['beam']]}/>);
  }
  else{
    for(let n = 0; n<2;n++){
      for (let i = 0; i < 1; i++) {
        const position = [0, height-beamDims.height/2,(projection)-0.5*colDims.width+n*colDims.width];
        beams.push(<Model key={generateRandomString(5)} url=".\models\lattice_beam.glb"position={position} name={"beam"} rotation={[0, Math.PI / 2, 0]} scale={[1,1,beamWidthScale]} mat_index={[attrs.materials['beam']]}/>);
      }
      const beamEnd1Position = [0.5*width-0.5/SCALE, height-beamDims.height/2,(projection)-0.5*colDims.width+n*colDims.width];
      const beamEnd2Position = [-0.5*width+0.5/SCALE, height-beamDims.height/2,(projection)-0.5*colDims.width+n*colDims.width];
      beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd1Position} name={"beam"} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);
      beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd2Position} name={"beam"} rotation={[0,Math.PI,0]} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);

    }
  }
  
}
else{
  if(!attrs.selectedHead){
    for(let n=0;n<2;n++){
      for (let i = 0; i < 1; i++) {
        const position = [0, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width/2];
        beams.push(<Model key={generateRandomString(5)} url=".\models\lattice_beam.glb"position={position} name={"beam"} rotation={[0, Math.PI / 2, 0]} scale={[1,1, beamWidthScale]} mat_index={[attrs.materials['beam']]}/>);
      }
      const beamEnd1Position = [0.5*width-0.5/SCALE, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width/2];
      const beamEnd2Position = [-0.5*width+0.5/SCALE, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width/2];
      beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd1Position} name={"beam"} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);
      beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd2Position} name={"beam"} rotation={[0,Math.PI,0]} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);
    }
  }
  else{
    for(let n = 0; n<2;n++){
      for (let i = 0; i < 2; i++) {
        const position = [0,height-beamDims.height/2,(projection-colDims.width)*n+colDims.width*i];
        beams.push(<Model key={generateRandomString(5)} url=".\models\lattice_beam.glb"position={position} name={"beam"} rotation={[0, Math.PI / 2, 0]} scale={[1,1,beamWidthScale]} mat_index={[attrs.materials['beam']]}/>);
        const beamEnd1Position = [0.5*width-0.5/SCALE, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width*i];
        const beamEnd2Position = [-0.5*width+0.5/SCALE, height-beamDims.height/2,(projection-colDims.width)*n+colDims.width*i];
        beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd1Position} name={"beam"} mat_index={[attrs.materials['beam']]} scale={[1,1,1]}/>);
        beamEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedEnd]}position={beamEnd2Position} name={"beam"} rotation={[0,Math.PI,0]} scale={[1,1,1]} mat_index={[attrs.materials['beam']]}/>);
      }
    }
  }
}
// ---------------------------END BEAMS---------------------------------
// ---------------------------RAFTERS---------------------------------
const rafters = [];
const rafterEnds = [];
rafters.push(<Model key={generateRandomString(10)} url=".\models\lattice_one_sided_beam.glb"position={THRASH} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setRafterDims}/>)
rafterEnds.push(<Model key={generateRandomString(10)} url={ends[attrs.selectedRafterEndCaps]} position={THRASH} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setRafterEndDims}/>)

const spacingBeams = 2/SCALE;

const rafterProjectionScale = rafterDims ? (projection) / rafterDims.width : 1;
let numberOfBeams = Math.floor(width/spacingBeams - 2);
if(attrs.mountMode!=3){
  for (let i = 0; i <= numberOfBeams; i++) {
    const rafterEnd1Position = [i*((width - 2*spacingBeams)/numberOfBeams)-width/2+spacingBeams, height+rafterDims.height/2,insulateds_limit+latticeDims.width];
    rafterEnds.push(<Model key={i} url={ends[attrs.selectedRafterEndCaps]}position={rafterEnd1Position} name={"rafter"} rotation={[0, -Math.PI / 2, 0]} scale={[1,1,1]} mat_index={[attrs.materials['rafter']]}/>);
  }
}
else{
  for (let i = 0; i <= numberOfBeams; i++) {
    for(let n=0;n<2;n++){
      const rafterEnd1Position = [i*((width - 2*spacingBeams)/numberOfBeams)-width/2+spacingBeams, height+rafterDims.height/2,n*(projection+1.2/SCALE)-0.6/SCALE];
      rafterEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedRafterEndCaps]}position={rafterEnd1Position} name={"rafter"} rotation={[0, n*2*-Math.PI / 2+Math.PI/2, 0]} scale={[1,1,1]} mat_index={[attrs.materials['rafter']]}/>);
    }
  }

}
// ---------------------------END RAFTERS---------------------------------

// ---------------------------INSULATEDS---------------------------------
const insulateds = [];
insulateds.push(<Model key={generateRandomString(10)} url=".\models\lattice_rafter.glb" position={THRASH} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setLatticeDims}/>)
insulateds.push(<Model key={generateRandomString(10)} url=".\models\lattice_one_sided_beam.glb" position={THRASH} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setLimiterDims}/>)
insulateds.push(<Model key={generateRandomString(10)} url=".\models\panel.glb" position={THRASH} rotation={[0, Math.PI / 2, 0]} onLoadCallback={setPanelDims}/>)
let panelHeightScale=0.4

if(attrs.mountMode!=3){
  const spacingRafters = 4/SCALE;
  const latticeWidthScale = latticeDims ? (projection) / latticeDims.depth : 1;
  let numberOfRafters = Math.ceil(width/spacingRafters)-1;
  
  for (let i = 0; i < numberOfRafters; i++) {
    const position = [spacingRafters*i-width/2+spacingRafters, height+limiterDims.height/2,(projection/2+(insulateds_limit-projection)/2)];
    insulateds.push(<Model key={i} url=".\models\lattice_one_sided_beam.glb" position={position} rotation={[0,  0, 0]} scale={[rafterSize/limiterDims.width*0.3,0.25,insulateds_limit/limiterDims.depth]}/>);
  }
  const platePosition = [0,height+panelDims.height/2,(projection/2+(insulateds_limit-projection)/2)];
  insulateds.push(<Model key={generateRandomString(5)} url=".\models\panel.glb" position={platePosition} rotation={[0, 0, 0]} scale={[width/panelDims.width,0.2*panelHeightScale,insulateds_limit/panelDims.depth]} mat_index={11}/>);
  const platePosition2 = [0,height+0.05/SCALE,(projection/2+(insulateds_limit-projection)/2)];
  insulateds.push(<Model key={generateRandomString(5)} url=".\models\panel.glb" position={platePosition2} name={"option"} rotation={[0, 0, 0]} scale={[width/panelDims.width,0.8*panelHeightScale,insulateds_limit/panelDims.depth]} mat_index={[attrs.materials['option']]}/>);
  const position1 = [0, height+beamDims.height/2,(insulateds_limit+latticeDims.width/2)];
  insulateds.push(<Model key={generateRandomString(6)} url=".\models\lattice_one_sided_beam.glb" position={position1} name={"rafter"} rotation={[0, 0, 0]} scale={[(width+limiterDims.depth)/limiterDims.width,0.4/SCALE/limiterDims.height,1]} mat_index={[attrs.materials['rafter']]}/>);
  const position2 = [0, height+beamDims.height/2,limiterDims.depth/2-latticeDims.width/2];
  insulateds.push(<Model key={generateRandomString(6)} url=".\models\lattice_one_sided_beam.glb" position={position2} name={"rafter"} rotation={[0, 0, 0]} scale={[(width+2.4*limiterDims.depth)/limiterDims.width,0.4/SCALE/limiterDims.height,1]} mat_index={[attrs.materials['rafter']]}/>);
  // if(attrs.mountMode==2){
  //   const position2 = [0, height+beamDims.height/2,limiterDims.depth/2-latticeDims.width/2];
  //   insulateds.push(<Model key={generateRandomString(6)} url=".\models\lattice_one_sided_beam.glb" position={position2} name={"rafter"} rotation={[0, 0, 0]} scale={[(width+limiterDims.depth)/limiterDims.width,0.4/SCALE/limiterDims.height,1]} mat_index={[attrs.materials['rafter']]}/>);
  // }
  for (let i = 0; i <= 1; i++) {
    const position2 = [-width/2+(latticeDims.width+width)*i-latticeDims.width/2, height+beamDims.height/2,(projection/2+((insulateds_limit+latticeDims.width)-projection)/2)];
    insulateds.push(<Model key={generateRandomString(6)} url=".\models\lattice_one_sided_beam.glb" position={position2} name={"rafter"} rotation={[0, Math.PI/2, 0]} scale={[(insulateds_limit+limiterDims.depth)/limiterDims.width,0.4/SCALE/limiterDims.height,1]} mat_index={[attrs.materials['rafter']]}/>);
    const rafterEnd1Position = [-width/2+(latticeDims.width+width)*i-latticeDims.width/2, height+beamDims.height/2,(insulateds_limit+latticeDims.width)];
    rafterEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedRafterEndCaps]}position={rafterEnd1Position} name={"rafter"} rotation={[0,-Math.PI/2, 0]} scale={[1,1,limiterDims.depth/rafterEndDims.depth]} mat_index={[attrs.materials['rafter']]}/>);
  }
  
}
else{
  const spacingRafters = 4/SCALE;
  const latticeWidthScale = latticeDims ? (projection) / latticeDims.depth : 1;
  const sep = (projection-colDims.width-1.4/SCALE)/(projection-1)
  let numberOfRafters = Math.ceil(width/spacingRafters)-1;
  for (let i = 0; i < numberOfRafters; i++) {
    const position = [spacingRafters*i-width/2+spacingRafters, height+limiterDims.height/2,((projection)/2)];
    insulateds.push(<Model key={i} url=".\models\lattice_one_sided_beam.glb" position={position} name={"insulated"} rotation={[0, Math.PI/2, 0]} scale={[insulateds_limit/limiterDims.width,0.25,rafterSize/limiterDims.depth*0.3]}/>);
  }
  const platePosition = [0,height+panelDims.height/2,(projection/2)];
  insulateds.push(<Model key={generateRandomString(5)} url=".\models\panel.glb" position={platePosition} rotation={[0, 0, 0]} scale={[width/panelDims.width,0.2*panelHeightScale,insulateds_limit/panelDims.depth]} mat_index={11}/>);
  const platePosition2 = [0,height+0.05/SCALE,(projection/2)];
  insulateds.push(<Model key={generateRandomString(5)} url=".\models\panel.glb" position={platePosition2} name={"option"} rotation={[0, 0, 0]} scale={[width/panelDims.width,0.8*panelHeightScale,insulateds_limit/panelDims.depth]} mat_index={[attrs.materials['option']]}/>);
  for (let i = 0; i <= 1; i++) {
    const position1 = [0, height+beamDims.height/2,i*(projection+1/SCALE)-0.5/SCALE];
    insulateds.push(<Model key={generateRandomString(6)} url=".\models\lattice_one_sided_beam.glb" position={position1} name={"rafter"} rotation={[0, 0, 0]} scale={[(width+0.5*limiterDims.depth)/limiterDims.width,0.4/SCALE/limiterDims.height,1]} mat_index={[attrs.materials['rafter']]}/>);
    for (let n = 0; n<2;n++){
      const position2 = [-width/2+(latticeDims.width+width)*i-latticeDims.width/2, height+beamDims.height/2,(projection/2)];
      insulateds.push(<Model key={generateRandomString(6)} url=".\models\lattice_one_sided_beam.glb" position={position2} name={"rafter"} rotation={[0, Math.PI/2, 0]} scale={[(projection+1.3/SCALE)/limiterDims.width,0.4/SCALE/limiterDims.height,1]} mat_index={[attrs.materials['rafter']]}/>);  
      const rafterEnd2Position = [-width/2+(latticeDims.width+width)*i-latticeDims.width/2, height+beamDims.height/2,n*(projection-rafterEndDims.depth/2+1.3/SCALE)-0.65/SCALE];
      rafterEnds.push(<Model key={generateRandomString(5)} url={ends[attrs.selectedRafterEndCaps]}position={rafterEnd2Position} name={"rafter"} rotation={[0, n*2*-Math.PI / 2+Math.PI/2, 0]} scale={[1,1,limiterDims.depth/rafterEndDims.depth]} mat_index={[attrs.materials['rafter']]}/>);
    }
  }
}
// ---------------------------END INSULATEDS---------------------------------
let cbs =  null;
if(attrs.mountMode!=3){
  if(attrs.mountMode==0){
    cbs = (
      <mesh material={cageMaterial} receiveShadow={false} castShadow={false} position={[0,attrs.height/(2*SCALE),-1.1/SCALE]}>
        <boxGeometry attach="geometry" args={[width,height+beamDims.height+2*rafterDims.height+1/SCALE,2/SCALE]} />
      </mesh>
    );
  }
  else if(attrs.mountMode==1){
    cbs = (
      <mesh material={cageMaterial} receiveShadow={false} castShadow={false} position={[0,attrs.height/(2*SCALE),-1.1/SCALE]}>
        <boxGeometry attach="geometry" args={[width,height+beamDims.height+2*rafterDims.height,2/SCALE]} />
      </mesh>
    );
  }
  else{
    cbs = (
      <mesh material={cageMaterial} receiveShadow={false} castShadow={false} position={[0,attrs.height/(2*SCALE),0]}>
        <boxGeometry attach="geometry" args={[width,height,2/SCALE]} />
      </mesh>
    );
  }
}
else{
  cbs = null
}
return (<group position={pos}>
    {columns}
    {posts}
    {rafterEnds}
    {rafters}
    {beamEnds}
    {beams}
    {insulateds}
    {cbs}
  </group>)
  
}
const buildLatticeAndInsulated = (attrs) =>{
  return (
    <group>
      {buildInsulated(attrs.leftAttrs,[-attrs.mixedRight*(attrs.leftAttrs.width>50?50:attrs.leftAttrs.width)/(2*SCALE),0,-attrs.projection/(2*SCALE)],50)}
      {buildLattice(attrs.rightAttrs,[attrs.mixedRight*(attrs.rightAttrs.width>50?50:attrs.rightAttrs.width)/(2*SCALE),0,-attrs.projection/(2*SCALE)],50)}
    </group>
  )
}

const buildMixed = (attrs) =>{
      return (
        <group>
            {buildInsulated(attrs.leftAttrs,attrs.isLatticeMiddle?[-(attrs.middleAttrs.width<50?attrs.middleAttrs.width:50)/(2*SCALE)-((attrs.leftAttrs.width<50?attrs.leftAttrs.width:50)/(2*SCALE)),0,-attrs.projection/(2*SCALE)]:THRASH,50)}
            {buildLattice(attrs.middleAttrs,attrs.isLatticeMiddle?[0,0,-attrs.projection/(2*SCALE)]:THRASH,50)}
            {buildInsulated(attrs.rightAttrs,attrs.isLatticeMiddle?[(attrs.middleAttrs.width<50?attrs.middleAttrs.width:50)/(2*SCALE)+((attrs.rightAttrs.width<50?attrs.rightAttrs.width:50)/(2*SCALE)),0,-attrs.projection/(2*SCALE)]:THRASH,50)}
            {/* insulated middle */}
            {buildLattice(attrs.leftAttrs,attrs.isLatticeMiddle?THRASH:[-(attrs.middleAttrs.width<50?attrs.middleAttrs.width:50)/(2*SCALE)-((attrs.leftAttrs.width<50?attrs.leftAttrs.width:50)/(2*SCALE)),0,-attrs.projection/(2*SCALE)],50)}
            {buildInsulated(attrs.middleAttrs,attrs.isLatticeMiddle?THRASH:[0,0,-attrs.projection/(2*SCALE)],50)}
            {buildLattice(attrs.rightAttrs,attrs.isLatticeMiddle?THRASH:[(attrs.middleAttrs.width<50?attrs.middleAttrs.width:50)/(2*SCALE)+((attrs.rightAttrs.width<50?attrs.rightAttrs.width:50)/(2*SCALE)),0,-attrs.projection/(2*SCALE)],50)}
        </group>
      )
}
const Pergola = () => {
  const [isLoading, setIsLoading] = useState(true);
  const attrs = useConfigurator();
  let pergola;

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Set the timeout duration in milliseconds (e.g., 2000ms for 2 seconds)

    // Clear the timeout if the component unmounts before the timeout completes
    return () => clearTimeout(loadingTimeout);
  }, []); // The empty dependency array ensures the effect runs only once after the initial render

  if(attrs){switch(attrs.model){
    case "lattice":
      pergola = buildLattice(attrs);
      break;
    case "insulated":
      pergola = buildInsulated(attrs);
      break;
    case "lattice-insulated":
      pergola = buildLatticeAndInsulated(attrs);
      break;
    case "mixed":
      pergola = buildMixed(attrs);
      break;
    default:
      pergola = (<>
      <Model url=".\models\pergalum_title.glb" position={[0,3/SCALE,0]} name={"insulated"} rotation={[0, Math.PI/2, 0]} scale={[1,1,1]} mat_index={9}></Model>
      <Model url=".\models\pergalum_title.glb" position={[0,3/SCALE,0]} name={"insulated"} rotation={[0, Math.PI/2, 0]} scale={[1.025,1.025,1.025]} mat_index={10}></Model>
      </>);
      break;
  }}
  return (
    <Canvas shadows={true}>
      <Environment files="./skybox.hdr" background />
      <ambientLight intensity={2} />
      <directionalLight castShadow={true} position={[10/SCALE, 15/SCALE, 10/SCALE]} shadow-mapSize={[1024, 1024]} intensity={2}>
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>
      <OrbitControls
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI * 85/ 180}
        maxDistance={120/SCALE}
        target={[0,0,0]}
      />
      <Plane receiveShadow position={[0, -5/SCALE, 0]} />
      <Glass position={[0, 15/SCALE, 0]}/>
      {isLoading && (
        <>
          <Model url=".\models\pergalum_title.glb" position={[0,3/SCALE,0]} name={"insulated"} rotation={[0, Math.PI/2, 0]} scale={[1,1,1]} mat_index={9}></Model>
          <Model url=".\models\pergalum_title.glb" position={[0,3/SCALE,0]} name={"insulated"} rotation={[0, Math.PI/2, 0]} scale={[1.025,1.025,1.025]} mat_index={10}></Model>
        </>
      )}
      {!isLoading && (
        pergola
      )}
    </Canvas>
  );

};


export default Pergola;
```