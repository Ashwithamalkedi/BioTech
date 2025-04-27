import React, { createContext, useContext, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

interface ProfileData {
  id: string;
  name: string;
  descriptors: Float32Array[];
  imageUrl: string;
  createdAt: Date;
}

interface FaceRecognitionContextType {
  profiles: ProfileData[];
  isModelsLoaded: boolean;
  modelsLoadingError: string | null;
  addProfile: (name: string, descriptor: Float32Array, imageUrl: string) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Omit<ProfileData, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  recognizeFaces: (
    detectedFaces: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[]
  ) => Promise<Array<{ detection: faceapi.FaceDetection; name: string }>>;
}

const FaceRecognitionContext = createContext<FaceRecognitionContextType | undefined>(undefined);

export const FaceRecognitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [modelsLoadingError, setModelsLoadingError] = useState<string | null>(null);

  // Load face recognition models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Create models directory in public
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setIsModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setModelsLoadingError('Failed to load face recognition models');
      }
    };

    loadModels();
    
    // Load saved profiles from localStorage
    const loadProfiles = () => {
      try {
        const savedProfiles = localStorage.getItem('faceProfiles');
        if (savedProfiles) {
          const parsedProfiles = JSON.parse(savedProfiles);
          
          // Convert stored descriptor arrays back to Float32Array
          const profilesWithFloat32Arrays = parsedProfiles.map((profile: any) => ({
            ...profile,
            descriptors: profile.descriptors.map((desc: number[]) => new Float32Array(desc)),
            createdAt: new Date(profile.createdAt),
          }));
          
          setProfiles(profilesWithFloat32Arrays);
        }
      } catch (error) {
        console.error('Error loading profiles from localStorage:', error);
      }
    };
    
    loadProfiles();
  }, []);

  // Save profiles to localStorage when they change
  useEffect(() => {
    if (profiles.length > 0) {
      try {
        // We need to convert Float32Array to regular arrays for localStorage
        const profilesForStorage = profiles.map(profile => ({
          ...profile,
          descriptors: profile.descriptors.map(desc => Array.from(desc)),
        }));
        
        localStorage.setItem('faceProfiles', JSON.stringify(profilesForStorage));
      } catch (error) {
        console.error('Error saving profiles to localStorage:', error);
      }
    }
  }, [profiles]);

  const addProfile = async (name: string, descriptor: Float32Array, imageUrl: string) => {
    const newProfile: ProfileData = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      descriptors: [descriptor],
      imageUrl,
      createdAt: new Date(),
    };
    
    setProfiles(prevProfiles => [...prevProfiles, newProfile]);
  };

  const updateProfile = async (id: string, updates: Partial<Omit<ProfileData, 'id' | 'createdAt'>>) => {
    setProfiles(prevProfiles => 
      prevProfiles.map(profile => 
        profile.id === id ? { ...profile, ...updates } : profile
      )
    );
  };

  const deleteProfile = async (id: string) => {
    setProfiles(prevProfiles => prevProfiles.filter(profile => profile.id !== id));
  };

  const recognizeFaces = async (
    detectedFaces: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[]
  ) => {
    if (!detectedFaces.length || !profiles.length) {
      return [];
    }
    
    const recognizedFaces: Array<{ detection: faceapi.FaceDetection; name: string }> = [];
    
    // For each face in the image
    for (const face of detectedFaces) {
      let bestMatch: { name: string; distance: number } | null = null;
      const faceDescriptor = face.descriptor;
      
      // Compare with each profile
      for (const profile of profiles) {
        for (const profileDescriptor of profile.descriptors) {
          const distance = faceapi.euclideanDistance(profileDescriptor, faceDescriptor);
          
          // Lower distance means better match
          // 0.6 is a common threshold for face recognition
          if (distance < 0.6 && (!bestMatch || distance < bestMatch.distance)) {
            bestMatch = {
              name: profile.name,
              distance,
            };
          }
        }
      }
      
      recognizedFaces.push({
        detection: face.detection,
        name: bestMatch ? bestMatch.name : 'Unknown',
      });
    }
    
    return recognizedFaces;
  };

  const value = {
    profiles,
    isModelsLoaded,
    modelsLoadingError,
    addProfile,
    updateProfile,
    deleteProfile,
    recognizeFaces,
  };

  return (
    <FaceRecognitionContext.Provider value={value}>
      {children}
    </FaceRecognitionContext.Provider>
  );
};

export const useFaceRecognition = () => {
  const context = useContext(FaceRecognitionContext);
  if (context === undefined) {
    throw new Error('useFaceRecognition must be used within a FaceRecognitionProvider');
  }
  return context;
};