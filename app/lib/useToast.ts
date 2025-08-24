import { useState, useCallback } from 'react';

interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'error2';
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastConfig & { isVisible: boolean }>({
    message: '', /* !! */
    type: 'info',
    duration: 3000,
    isVisible: false
  });

  const showToast = useCallback((config: ToastConfig) => {
    setToast({
      ...config,
      isVisible: true
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  return { toast, showToast, hideToast };
}