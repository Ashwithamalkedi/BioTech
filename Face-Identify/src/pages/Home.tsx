import React from 'react';
import { Camera, Users, SpaceIcon as FaceIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <FaceIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Facial Recognition System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload photos, identify faces, and build your facial recognition database with our advanced AI-powered platform.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard 
          title="Identify People"
          description="Upload any photo and identify the people in it using our advanced facial recognition technology."
          icon={<Camera className="w-10 h-10" />}
          buttonText="Recognize Faces"
          buttonLink="/recognize"
        />
        
        <FeatureCard 
          title="Manage Profiles"
          description="Create and manage facial profiles by adding photos and associating them with names."
          icon={<Users className="w-10 h-10" />}
          buttonText="Manage Profiles"
          buttonLink="/profiles"
        />
        
        <FeatureCard 
          title="View Gallery"
          description="Browse your gallery of recognized faces and associated profiles in one convenient place."
          icon={<FaceIcon className="w-10 h-10" />}
          buttonText="Open Gallery"
          buttonLink="/gallery"
        />
      </div>

      <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          How it Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard 
            number={1} 
            title="Create Profiles" 
            description="Add facial profiles by uploading photos and associating them with names."
          />
          
          <StepCard 
            number={2} 
            title="Upload Photos" 
            description="Upload any photo containing faces you want to identify."
          />
          
          <StepCard 
            number={3} 
            title="Get Results" 
            description="Our system will match faces in your photos with your saved profiles."
          />
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonLink: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  buttonText, 
  buttonLink 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full transition-transform duration-300 hover:translate-y-[-4px]">
      <div className="text-blue-500 mb-4">
        {icon}
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-6 flex-grow">
        {description}
      </p>
      
      <Link to={buttonLink}>
        <Button variant="primary" fullWidth>
          {buttonText}
        </Button>
      </Link>
    </div>
  );
};

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-4">
        <span className="text-xl font-semibold">{number}</span>
      </div>
      
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default Home;