import React, { useState } from 'react';
import { Search, Users, Image as ImageIcon } from 'lucide-react';
import { useFaceRecognition } from '../contexts/FaceRecognitionContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Gallery: React.FC = () => {
  const { profiles } = useFaceRecognition();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Face Gallery</h1>
        <p className="text-gray-600">
          Browse your collection of recognized faces
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search profiles by name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {profiles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Profiles in Gallery</h2>
          <p className="text-gray-600 mb-6">
            You need to create profiles before they can appear in your gallery
          </p>
          <Link to="/profiles">
            <Button variant="primary">Manage Profiles</Button>
          </Link>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Matching Profiles</h2>
          <p className="text-gray-600 mb-6">
            No profiles match your search term. Try a different search.
          </p>
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="h-64 bg-gray-200 overflow-hidden relative">
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {profile.descriptors.length} descriptors
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{profile.name}</h3>
                <p className="text-sm text-gray-500">
                  Added {profile.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;