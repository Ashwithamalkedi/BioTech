import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <Check className="w-5 h-5" />,
  error: <X className="w-5 h-5" />,
  warning: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles: Record<ToastType, string> = {
  success: 'bg-emerald-100 text-emerald-600',
  error: 'bg-red-100 text-red-600',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-blue-100 text-blue-600',
};

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation to complete
    }, duration);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [id, duration, onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`
        max-w-md w-full border rounded-lg shadow-lg pointer-events-auto relative overflow-hidden
        ${toastStyles[type]}
        ${isVisible ? 'animate-enter' : 'animate-leave'}
      `}
      style={{
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 300ms, opacity 300ms',
      }}
    >
      <div className="p-4 flex items-start">
        <div className={`${iconStyles[type]} p-2 rounded-full mr-3 mt-0.5`}>
          {toastIcons[type]}
        </div>
        
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-medium">{message}</p>
        </div>
        
        <button
          onClick={handleClose}
          className="ml-4 text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div 
        className={`h-1 ${iconStyles[type].split(' ')[1]} bg-opacity-40`}
        style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
      />
    </div>
  );
};

export default Toast;