"use client";
import { useState, useEffect } from 'react';

export function Waveform() {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    setHeights([...Array(5)].map(() => Math.random() * 50 + 10));
  }, []);

  if (heights.length === 0) {
    return null;
  }

  return (
    <div className="w-48 h-48 flex items-center justify-center">
      <div className="flex items-center justify-center space-x-1.5">
        {heights.map((height, i) => (
          <div
            key={i}
            className="w-1.5 bg-primary/80 rounded-full animate-wave"
            style={{
              height: `${height}px`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
