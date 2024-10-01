"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useConfigurator } from '../contexts/Configurator';

function useScaraWebSocket(url) {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const ws = useRef(null);
    const attrs = useConfigurator();

    const handleMessage = useCallback((event) => {
        const res = JSON.parse(event.data);
        console.log('Controlador:', res);

        attrs.setX(res.X);
        attrs.setY(res.Y);
        attrs.setZ(res.Z);
        attrs.setSegmento2(res.O);
        attrs.setGripper(res.G);
        
    }, [attrs]);

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

const ScaraController = () => {
    const { isConnected, error } = useScaraWebSocket('ws://192.168.38.112:81/');

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-row justify-center font-bold my-2'>
                <span className={isConnected ? "text-[#50FF50]" : "text-red"}>
                    {isConnected ? 'Conexión con control disponible' : 'Error al conectar el control'}
                </span>
            </div>
        </div>
    );
};

export default ScaraController;