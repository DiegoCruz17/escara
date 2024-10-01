"use client"
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useConfigurator } from '../contexts/Configurator';

const Joystick = () => {
  const attrs = useConfigurator()
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('Origen');
  const joystickRef = useRef(null);
  const isDraggingRef = useRef(false);
  const handleVarChange = (variable, setter, speed) => {
    setter(prevValue => prevValue + speed);
  }
  const handleMouseDown = useCallback((e) => {
    isDraggingRef.current = true;
    updatePosition(e);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current) {
      updatePosition(e);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setPosition({ x: 0, y: 0 });
    setDirection('Center');
  }, []);

  const updatePosition = useCallback((e) => {
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    let x = (e.clientX - rect.left - centerX) / centerX;
    let y = (e.clientY - rect.top - centerY) / centerY;

    // Clamp values to [-1, 1] range
    x = Math.max(-1, Math.min(1, x));
    y = Math.max(-1, Math.min(1, y));

    setPosition({ x, y });
    updateDirection(x, y);
  }, []);

  const updateDirection = useCallback((x, y) => {
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    let direction;
    if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) {
      direction = 'Origen';
    } else if (angle < 0 && angle >= -45) {
      direction = '+X';
      handleVarChange(attrs.x, attrs.setX, 5)
    } else if (angle < -45 && angle >= -90) {
      direction = '+Y';
      handleVarChange(attrs.y, attrs.setY, 5)
    } else if (angle < -90 && angle >= -135) {
      direction = '+Z';
      handleVarChange(attrs.z, attrs.setZ, 5)
    } else if (angle < -135 && angle >= -180) {
      direction = '+O';
      handleVarChange(attrs.segmento2, attrs.setSegmento2, 5)
    } else if (angle < 180 && angle >= 135) {
      direction = '-X';
      handleVarChange(attrs.x, attrs.setX, -5)
    } else if (angle < 135 && angle >= 90) {
      direction = '-Y';
      handleVarChange(attrs.y, attrs.setY, -5)
    } else if (angle < 90 && angle >= 45) {
      direction = '-Z';
      handleVarChange(attrs.z, attrs.setZ, -5)
    } else if (angle < 45 && angle >= 0) {
      direction = '-O';
      handleVarChange(attrs.segmento2, attrs.setSegmento2, -5)
    }
    setDirection(direction);
  }, [attrs]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <div 
        ref={joystickRef}
        className="relative w-64 h-64 bg-gray-300 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <div 
          className="absolute w-16 h-16 bg-blue-500 rounded-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${position.x * 96}px, ${position.y * 96}px)`,
            top: 'calc(50% - 2rem)',
            left: 'calc(50% - 2rem)',
          }}
        />
      </div>
      <div className="mt-4 text-xl font-bold">
        Direction: {direction}
      </div>
    </div>
  );
};

export default Joystick;