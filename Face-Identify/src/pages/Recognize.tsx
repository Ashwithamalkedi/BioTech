import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Camera, RefreshCw } from 'lucide-react';
import * as faceapi from 'face-api.js';
import ImageUploader from '../components/ImageUploader';
import FaceDetectionCanvas from '../components/FaceDetectionCanvas';
import Button from '../components/ui/Button';
import { useFaceRecognition } from '../contexts/FaceRecognitionContext';
import { useToast } from '../hooks/useToast';

const Recognize: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[] | null>(null);
  const [recognizedFaces, setRecognizedFaces] = useState<Array<{ detection: faceapi.FaceDetection; name: string }> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { profiles, recognizeFaces, isModelsLoaded } = useFaceRecognition();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const handleImageUpload = (uploadedImageUrl: string) => {
    // Reset state when a new image is uploaded
    setImageUrl(uploadedImageUrl);
    setDetectedFaces(null);
    setRecognizedFaces(null);
  };
  
  const handleFacesDetected = (faces: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[]) => {
    setDetectedFaces(faces);
    
    if (faces.length === 0) {
      showToast('No faces detected in the image', 'warning');
    } else if (profiles.length === 0) {
      showToast('You have no profiles created. Create profiles to recognize faces.', 'info');
    }
  };
  
  const handleIdentifyFaces = async () => {
    if (!detectedFaces) return;
    
    if (profiles.length === 0) {
      showToast('You need to create facial profiles before identifying people', 'warning');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const results = await recognizeFaces(detectedFaces);
      setRecognizedFaces(results);
      
      // Count known faces
      const knownFaces = results.filter(result => result.name !== 'Unknown').length;
      
      if (knownFaces === 0) {
        showToast('No known faces were recognized', 'info');
      } else {
        showToast(`${knownFaces} face(s) recognized successfully`, 'success');
      }
    } catch (error) {
      console.error('Error recognizing faces:', error);
      showToast('Error recognizing faces', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReset = () => {
    setImageUrl(null);
    setDetectedFaces(null);
    setRecognizedFaces(null);
  };
  
  const handleAddNewProfile = () => {
    if (!detectedFaces || detectedFaces.length === 0) {
      showToast('No faces detected to add as profile', 'error');
      return;
    }
    
    // Store the first detected face in session storage
    // and navigate to profile creation page
    sessionStorage.setItem(
      'newProfileFace', 
      JSON.stringify({
        descriptor: Array.from(detectedFaces[0].descriptor),
        imageUrl
      })
    );
    
    navigate('/profiles/new');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Face Recognition</h1>
        <p className="text-gray-600">
          Upload a photo to detect and identify faces based on your saved profiles
        </p>
      </div>
      
      {!imageUrl ? (
        <ImageUploader onImageUpload={handleImageUpload} className="mb-6" />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Image preview with face detection */}
          <FaceDetectionCanvas 
            imageUrl={imageUrl} 
            onFacesDetected={handleFacesDetected}
            recognizedFaces={recognizedFaces || undefined}
          />
          
          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={handleReset}
            >
              Upload New Image
            </Button>
            
            {detectedFaces && detectedFaces.length > 0 && (
              <>
                <Button
                  variant="primary"
                  leftIcon={<Camera className="w-4 h-4" />}
                  onClick={handleIdentifyFaces}
                  isLoading={isProcessing}
                  disabled={!isModelsLoaded || profiles.length === 0}
                >
                  Identify Faces
                </Button>
                
                <Button
                  variant="secondary"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={handleAddNewProfile}
                  disabled={!detectedFaces || detectedFaces.length === 0}
                >
                  Add as New Profile
                </Button>
              </>
            )}
          </div>
          
          {/* Recognition results */}
          {recognizedFaces && recognizedFaces.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Recognition Results
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recognizedFaces.map((face, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${face.name !== 'Unknown' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="font-medium text-gray-900">
                        Face {index + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">
                      <span className="font-semibold">Identified as:</span>{' '}
                      {face.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Help text for no profiles */}
          {profiles.length === 0 && detectedFaces && detectedFaces.length > 0 && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-blue-700 mb-2">
                You haven't created any profiles yet
              </p>
              <p className="text-blue-600 text-sm">
                Create profiles to start recognizing faces in your photos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recognize;