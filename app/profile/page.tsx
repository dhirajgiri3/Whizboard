"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { RequireAuth } from '@/components/auth/ProtectedRoute';

interface ProfileData {
  image?: string;
  imageDescription?: string;
  name?: string;
  email?: string;
}

const ProfilePage = () => {
    const [profileData, setProfileData] = useState<ProfileData>({});
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await fetch('/api/settings/account');
            if (response.ok) {
                const data = await response.json();
                setProfileData(data.user);
                setDescription(data.user.imageDescription || '');
            }
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
        }
    };

    const handleDescriptionSave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/settings/account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: description,
                }),
            });

            if (response.ok) {
                toast.success('Image description updated successfully!');
                setIsEditingDescription(false);
                setProfileData(prev => ({ ...prev, imageDescription: description }));
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to update description');
            }
        } catch (error) {
            toast.error('Failed to update description');
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <User className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Profile Image Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Profile Image</h2>
                            <div className="flex items-start gap-4">
                                <div className="relative">
                                    <img
                                        src={profileData.image || '/default-avatar.png'}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 shadow-lg"
                                    />
                                    <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-full">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Image Description
                                        </label>
                                        {!isEditingDescription ? (
                                            <div className="flex items-center gap-2">
                                                <p className="text-slate-600 flex-1">
                                                    {profileData.imageDescription || 'No description added'}
                                                </p>
                                                <button
                                                    onClick={() => setIsEditingDescription(true)}
                                                    className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                                                    title="Edit description"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Describe your profile image..."
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows={3}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleDescriptionSave}
                                                        disabled={isLoading}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1 text-sm"
                                                    >
                                                        <Save className="w-3 h-3" />
                                                        {isLoading ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingDescription(false);
                                                            setDescription(profileData.imageDescription || '');
                                                        }}
                                                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium flex items-center gap-1 text-sm"
                                                    >
                                                        <X className="w-3 h-3" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p className="text-xs text-slate-500">
                                        <a 
                                            href="/settings" 
                                            className="text-blue-600 hover:text-blue-700 underline"
                                        >
                                            Go to Settings
                                        </a> to upload a new profile image
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Information */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Profile Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <p className="text-slate-900 font-medium">{profileData.name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <p className="text-slate-900 font-medium">{profileData.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
                                    <p className="text-slate-900 font-medium">Standard Account</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default function ProfilePageWrapper() {
  return (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  );
}
