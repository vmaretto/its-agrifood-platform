'use client';

import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 1
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        const factor = Math.pow(10, decimals);
        setCount(Math.floor(start * factor) / factor);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration, decimals]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return <span>{prefix}{count}{suffix}</span>;
}

export default AnimatedCounter;
