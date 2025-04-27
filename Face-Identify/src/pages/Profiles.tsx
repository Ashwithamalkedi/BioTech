import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import { useFaceRecognition } from '../contexts/FaceRecognitionContext';
import { useToast } from '../hooks/useToast';

const Profiles: React.FC = () => {
  const { profiles, deleteProfile } = useFaceRecognition();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleNewProfile = () => {
    navigate('/profiles/new');
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      setDeletingId(profileId);
      await deleteProfile(profileId);
      showToast('Profile deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting profile:', error);
      showToast('Failed to delete profile', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Face Profiles</h1>
          <p className="text-gray-600">
            Manage your facial recognition profiles
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleNewProfile}
        >
          New Profile
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Profiles Yet</h2>
          <p className="text-gray-600 mb-6">
            Start by creating facial profiles to enable face recognition
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleNewProfile}
          >
            Create First Profile
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:translate-y-[-4px]"
            >
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{profile.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Added {profile.createdAt.toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {profile.descriptors.length} facial descriptor{profile.descriptors.length !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                    onClick={() => handleDeleteProfile(profile.id)}
                    isLoading={deletingId === profile.id}
                    className="text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profiles;