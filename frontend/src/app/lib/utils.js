import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { useState, useEffect, useRef,useCallback } from 'react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}



export const useIncrementalUpdate = () => {
  const incrementalUpdate = async (current, target, setter, duration) => {
    const steps = 60; // 60 fps
    const increment = (target - current) / steps;
    const stepDuration = duration / steps;

    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      setter(prevValue => prevValue + increment);
    }

    // Ensure the final value is exactly the target
    setter(target);
  };

  return incrementalUpdate;
};