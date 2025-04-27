import React from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import { useToast } from '../../hooks/useToast';

const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();
  
  if (!toasts.length) return null;
  
  return createPortal(
    <div className="fixed top-0 right-0 p-4 w-full md:max-w-sm z-50 flex flex-col items-end space-y-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>,
    document.body
  );
};

export default Toaster;

export { Toaster }