import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, className = '' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create a local object URL for the image
      const imageUrl = URL.createObjectURL(file);
      onImageUpload(imageUrl);
      showToast('Image uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Error uploading image', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload, showToast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        rounded-lg border-2 border-dashed p-8 
        transition-colors duration-200 ease-in-out cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
        ${isUploading ? 'opacity-75 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        {isUploading ? (
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        ) : (
          <>
            {isDragActive ? (
              <ImageIcon className="w-12 h-12 text-blue-500 mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
            )}
          </>
        )}
        
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {isUploading ? 'Uploading...' : isDragActive ? 'Drop the image here' : 'Upload an image'}
        </h3>
        
        <p className="text-sm text-gray-500">
          {isUploading 
            ? 'Please wait while we process your image' 
            : 'Drag and drop an image, or click to select a file'}
        </p>
        
        <p className="text-xs text-gray-400 mt-2">
          PNG, JPG or GIF up to 5MB
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;