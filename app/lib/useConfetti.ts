import { useState, useCallback } from 'react';

export function useConfetti() {
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  const triggerConfetti = useCallback(() => {
    setIsConfettiActive(true);
    
    setTimeout(() => {
      setIsConfettiActive(false);
    }, 2000);
  }, []);

  return { isConfettiActive, triggerConfetti };
}