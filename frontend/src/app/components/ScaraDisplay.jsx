"use client"
import React from 'react';
import { useState, useEffect, useCallback } from 'react';

function useScaraWebSocket(url){
    const [scaraData, setScaraData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
  
    const connect = useCallback(() => {
      const ws = new WebSocket(url);
  
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };
  
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setScaraData(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isConnected) {
    return <div>Connecting to SCARA...</div>;
  }

  if (!scaraData) {
    return <div>Waiting for SCARA data...</div>;
  }

  return (
    <div className="scara-display">
      <h2>SCARA Data</h2>
      <div>
        <h3>Main Matrix</h3>
        <pre>{JSON.stringify(scaraData.matrix, null, 2)}</pre>
      </div>
      <div>
        <h3>Joint Matrices</h3>
        <div>
          <h4>Matrix 1</h4>
          <pre>{JSON.stringify(scaraData.matrix1, null, 2)}</pre>
        </div>
        <div>
          <h4>Matrix 2</h4>
          <pre>{JSON.stringify(scaraData.matrix2, null, 2)}</pre>
        </div>
        <div>
          <h4>Matrix 3</h4>
          <pre>{JSON.stringify(scaraData.matrix3, null, 2)}</pre>
        </div>
        <div>
          <h4>Matrix 4</h4>
          <pre>{JSON.stringify(scaraData.matrix4, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default ScaraDisplay;