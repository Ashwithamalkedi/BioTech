import * as faceapi from 'face-api.js';

// Fix for running in browser environment
const isBrowser = typeof window !== 'undefined';

// URL of models - use CDN hosted models
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

// Load models from external source
export async function loadModels() {
  if (!isBrowser) return;
  
  try {
    // Check if models are already loaded
    const modelState = localStorage.getItem('faceModelsLoaded');
    if (modelState === 'true') return true;
    
    // Configure model paths
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
    
    // Load models from CDN
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    // Mark models as loaded
    localStorage.setItem('faceModelsLoaded', 'true');
    return true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    return false;
  }
}

// Helper function to reset models (for debugging)
export function resetModels() {
  localStorage.removeItem('faceModelsLoaded');
}