"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useConfigurator } from '../contexts/Configurator';
import { useIncrementalUpdate } from '../lib/utils';

function useScaraWebSocket(url) {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const ws = useRef(null);
    const attrs = useConfigurator();
    const incrementalUpdate = useIncrementalUpdate();

    const handleMessage = useCallback((event) => {
        const res = JSON.parse(event.data);
        console.log('Synch', attrs.synch);
        console.log('Received SCARA data:', res);

        if (attrs.synch) {
            attrs.setBase(res.base);
            attrs.setSegmento1(res.segmento1);
            attrs.setZAxis(res.zAxis);
            attrs.setSegmento2(res.segmento2);
            attrs.setGripper(res.gripper);
        } else {
            console.log("No hay sincronizacion");
        }

        // Uncomment if you want to use incremental update
        // if (attrs.synch) {
        //     incrementalUpdate(attrs.base, res.base, attrs.setBase, 500);
        //     incrementalUpdate(attrs.segmento1, res.segmento1, attrs.setSegmento1, 500);
        //     incrementalUpdate(attrs.zAxis, res.zAxis, attrs.setZAxis, 500);
        //     incrementalUpdate(attrs.gripper, res.gripper, attrs.setGripper, 500);
        //     incrementalUpdate(attrs.segmento2, res.segmento2, attrs.setSegmento2, 500);
        // }
    }, [attrs, incrementalUpdate]);

    useEffect(() => {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setError(null);
        };

        ws.current.onclose = (event) => {
            if (event.wasClean) {
                console.log(`WebSocket closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
                console.error('WebSocket connection died');
            }
            setIsConnected(false);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('WebSocket error occurred');
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [url]);

    useEffect(() => {
        if (ws.current) {
            ws.current.onmessage = handleMessage;
        }
    }, [handleMessage]);

    return { isConnected, error };
}

const ScaraDisplay = () => {
    const { isConnected, error } = useScaraWebSocket('ws://127.0.0.1:8000/ws/scara/');
    const { synch, setSynch } = useConfigurator();

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-row justify-center font-bold my-2'>
                <span className={isConnected ? "text-[#50FF50]" : "text-red"}>
                    {isConnected ? 'Conexión disponible' : 'Error al conectar'}
                </span>
            </div>
            <button 
                onClick={() => setSynch(!synch)} 
                className={`mt-2 px-4 py-2 rounded ${synch ? 'bg-green-500' : 'bg-red-500'} text-white`}
            >
                Sincronización: {synch ? 'ON' : 'OFF'}
            </button>
        </div>
    );
};

export default ScaraDisplay;