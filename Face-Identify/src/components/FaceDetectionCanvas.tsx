import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Loader2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface FaceDetectionCanvasProps {
  imageUrl: string;
  onFacesDetected?: (faces: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[]) => void;
  recognizedFaces?: Array<{ detection: faceapi.FaceDetection; name: string }>;
}

const FaceDetectionCanvas: React.FC<FaceDetectionCanvasProps> = ({
  imageUrl,
  onFacesDetected,
  recognizedFaces,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const { showToast } = useToast();

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        
        // Load required face-api models
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        
        // Proceed once the image is loaded
        if (imgRef.current && imgRef.current.complete) {
          await processImage();
        }
      } catch (error) {
        console.error('Error loading models:', error);
        showToast('Error loading face detection models', 'error');
        setIsLoading(false);
      }
    };

    loadModels();
  }, [imageUrl]);

  useEffect(() => {
    if (imgRef.current && canvasRef.current && recognizedFaces && !isLoading) {
      drawRecognizedFaces();
    }
  }, [recognizedFaces, isLoading]);

  const processImage = async () => {
    if (!imgRef.current || !canvasRef.current) return;
    
    try {
      // Calculate image dimensions maintaining aspect ratio
      const img = imgRef.current;
      const maxWidth = 640;
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      
      setImgDimensions({ width, height });
      
      // Configure canvas
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      
      // Detect faces with descriptors
      const fullFaceDescriptions = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      if (fullFaceDescriptions.length === 0) {
        showToast('No faces detected in the image', 'warning');
      } else {
        showToast(`${fullFaceDescriptions.length} face(s) detected`, 'success');
        
        // Draw face detections
        const displaySize = { width, height };
        faceapi.matchDimensions(canvas, displaySize);
        
        const resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize);
        
        // Clear canvas and draw detections
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          
          // Draw detection boxes
          faceapi.draw.drawDetections(canvas, resizedDetections);
          
          // Callback with detected faces
          if (onFacesDetected) {
            onFacesDetected(fullFaceDescriptions);
          }
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
      showToast('Error processing image', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const drawRecognizedFaces = () => {
    if (!canvasRef.current || !recognizedFaces) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear existing drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw detection boxes and labels
    recognizedFaces.forEach(({ detection, name }) => {
      const { x, y, width, height } = detection.box;
      
      // Draw rectangle
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(x, y - 30, name.length * 9 + 20, 30);
      
      // Draw label text
      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(name, x + 10, y - 10);
    });
  };

  const handleImageLoad = async () => {
    await processImage();
  };

  return (
    <div className="relative flex justify-center my-4">
      <div 
        className="relative max-w-full overflow-hidden rounded-lg"
        style={{ width: imgDimensions.width, height: imgDimensions.height }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Upload for face detection"
          className="max-w-full h-auto"
          style={{ 
            maxWidth: '100%', 
            visibility: isLoading ? 'hidden' : 'visible'
          }}
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
        />
      </div>
    </div>
  );
};

export default FaceDetectionCanvas;