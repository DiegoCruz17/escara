"use client"
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useConfigurator } from '../contexts/Configurator';
import { useIncrementalUpdate } from '../lib/utils';
function useScaraWebSocket(url){
    const [scaraData, setScaraData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const attrs = useConfigurator()
    const incrementalUpdate = useIncrementalUpdate();

  
    const connect = useCallback(() => {
      const ws = new WebSocket(url);
  
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };
      ws.onmessage = (event) => {
        const res = JSON.parse(event.data);
        console.log('Received SCARA data:', res);
        if(res.q1a && res.q2a && res.zAxis){
          // attrs.setBase(res.q1a)
          // attrs.setSegmento1(res.q2a)
          // attrs.setZAxis(res.zAxis)
          incrementalUpdate(attrs.base, res.q1a, attrs.setBase, 2000);
          incrementalUpdate(attrs.segmento1, res.q2a, attrs.setSegmento1, 2000);
          incrementalUpdate(attrs.zAxis, res.zAxis, attrs.setZAxis, 2000);
        }
      };
  
      ws.onclose = (event) => {
        if (event.wasClean) {
          console.log(`WebSocket closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
          console.error('WebSocket connection died');
        }
        setIsConnected(false);
      };
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket error occurred');
      };
  
      return () => {
        ws.close();
      };
    }, [url]);
  
    useEffect(() => {
      const cleanup = connect();
      return cleanup;
    }, [connect]);
  
    return { scaraData, isConnected, error };
  };

  
const ScaraDisplay = () => {
  const { scaraData, isConnected, error } = useScaraWebSocket('ws://127.0.0.1:8000/ws/scara/');

  return (<div className='flex flex-row justify-center font-bold my-2'><span className={isConnected?"text-[#50FF50]":"text-red"}>{isConnected ? 'Conexión disponible':'Error al conectar'}</span></div>)


};

export default ScaraDisplay;