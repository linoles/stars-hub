'use client';

import { useEffect, useState, useCallback } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  animationDuration: number;
  rotation: number;
  size: number;
  color: string;
  delay: number;
}

const colors = [
  'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
  'bg-purple-400', 'bg-pink-400', 'bg-orange-400', 'bg-teal-400'
];

export default function Confetti({ isActive }: { isActive: boolean }) {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  const createConfetti = useCallback(() => {
    const pieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < 150; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 2 + Math.random() * 3,
        rotation: Math.random() * 360,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2
      });
    }
    
    setConfettiPieces(pieces);
  }, []);

  useEffect(() => {
    if (isActive) {
      createConfetti();
      
      // Автоматически очищаем конфетти через 5 секунд
      const timer = setTimeout(() => {
        setConfettiPieces([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isActive, createConfetti]);

  if (!isActive || confettiPieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute ${piece.color} rounded-sm`}
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            width: `${piece.size}px`,
            height: `${piece.size * 3}px`,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${piece.animationDuration}s ease-in ${piece.delay}s forwards`
          }}
        />
      ))}
    </div>
  );
}