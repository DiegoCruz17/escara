"use client"
import React, { useState, useRef, useEffect } from 'react';

const Joystick = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(null);
  const joystickRef = useRef(null);

  const handleMouseDown = (e) => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let x = e.clientX - centerX;
      let y = e.clientY - centerY;

      // Limit the joystick movement to the circular area
      const radius = rect.width / 2;
      const distance = Math.sqrt(x * x + y * y);
      if (distance > radius) {
        x = (x / distance) * radius;
        y = (y / distance) * radius;
      }

      setPosition({ x, y });

      // Calculate the angle and determine the active section
      const angle = (Math.atan2(y, x) * 180) / Math.PI;
      const section = Math.floor(((angle + 180 + 22.5) % 360) / 45);
      setActiveSection(section);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    setPosition({ x: 0, y: 0 });
    setActiveSection(null);
  };

  const sections = [
    'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
  ];

  return (
    <div className="flex flex-col items-center justify-center bg-white mb-[20%]">
      <div 
        ref={joystickRef}
        className="relative w-64 h-64 bg-gray-300 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        {sections.map((section, index) => (
          <div
            key={section}
            className={`absolute w-full h-full flex items-center justify-center text-lg font-bold ${
              activeSection === index ? 'text-red-500' : 'text-gray-600'
            }`}
            style={{
              transform: `rotate(${index * 45}deg)`,
              clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)',
            }}
          >
            {section}
          </div>
        ))}
        <div
          className="absolute w-16 h-16 bg-blue-500 rounded-full"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: 'transform 0.1s',
            top: 'calc(50% - 2rem)',
            left: 'calc(50% - 2rem)',
          }}
        />
      </div>
      <div className="mt-4 text-xl font-bold">
        Active Section: {activeSection !== null ? sections[activeSection] : 'None'}
      </div>
    </div>
  );
};

export default Joystick;