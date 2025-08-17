"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Camera,
    Settings,
    ExternalLink,
    Mail,
    Calendar,
    Shield,
    Activity,
    BarChart3,
    Users,
    Folder,
    Zap,
    MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { RequireAuth } from '@/components/auth/ProtectedRoute';
import BackButton from '@/components/ui/BackButton';
import api from '@/lib/http/axios';
import { useAppContext } from '@/lib/context/AppContext';

interface ProfileData {
    image?: string;
    name?: string;
    email?: string;
    username?: string;
    bio?: string;
    createdAt?: string;
    lastLoginAt?: string;
}

interface UserStats {
    boards: {
        total: number;
        owned: number;
        collaborated: number;
        recent: number;
    };
    collaboration: {
        totalCollaborators: number;
        collaborationRate: number;
    };
    elements: {
        total: number;
        created: number;
        recent: number;
    };
    invitations: {
        total: number;
        sent: number;
        received: number;
        accepted: number;
        acceptanceRate: number;
    };
    activity: {
        total: number;
        recent: number;
        dailyActivity: Array<{ _id: string; count: number }>;
    };
}

// Reusable UI components matching the design system
const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors backdrop-blur-sm ${className}`}
    >
        <div className="relative z-10">{children}</div>
    </motion.div>
);

const SecondaryButton = ({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button
        {...rest}
        className={`px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black ${className}`}
    >
        <span className="flex items-center justify-center gap-2">{children}</span>
    </button>
);

const ProfilePage = () => {
    const { user } = useAppContext();
    const [profileData, setProfileData] = useState<ProfileData>({});
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch profile data and stats in parallel
            const [profileResponse, statsResponse] = await Promise.all([
                api.get('/api/settings/account'),
                api.get('/api/settings/account/stats')
            ]);

            const userData = profileResponse.data.user;
            
            // Check for warnings in the response
            if (profileResponse.data.warning) {
                console.warn('Profile data warning:', profileResponse.data.warning);
                // Show a gentle notification to the user
                toast.info('Some profile data may be limited. Please try refreshing the page.');
            }
            
            // Use database image if available, otherwise fall back to Google profile image from session
            setProfileData({
                ...userData,
                image: userData.image || user?.avatar || undefined
            });
            
            // Only set stats if the response is successful
            if (statsResponse.data.stats) {
                setUserStats(statsResponse.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
            toast.error('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not available';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';

            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getTimeAgo = (dateString?: string) => {
        if (!dateString) return 'Not available';
        try {
            const now = new Date();
            const date = new Date(dateString);

            if (isNaN(date.getTime())) return 'Invalid date';

            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            if (diffInMinutes < 5) return 'Just now';
            if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
            if (diffInHours < 24) return `${diffInHours} hours ago`;
            if (diffInDays === 0) return 'Today';
            if (diffInDays === 1) return 'Yesterday';
            if (diffInDays < 7) return `${diffInDays} days ago`;
            if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
            if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
            return `${Math.floor(diffInDays / 365)} years ago`;
        } catch (error) {
            return 'Invalid date';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-gray-950 pt-32">
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-orb-blue" />
                <div className="absolute bottom-1/3 right-1/4 w-60 h-60 gradient-orb-blue" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white/60">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gray-950 pb-16 pt-20 md:pt-24">
            {/* Background effects matching settings page */}
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-orb-blue" />
            <div className="absolute bottom-1/3 right-1/4 w-60 h-60 gradient-orb-blue" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <BackButton
                        variant="dark"
                        position="relative"
                        size="md"
                        label="Back to Dashboard"
                    />
                </div>

                {/* Profile Header */}
                <SectionCard className="mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
                    >
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-white/[0.05] border-2 border-white/[0.1] overflow-hidden">
                                    {profileData.image ? (
                                        <img
                                            src={profileData.image}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center ${profileData.image ? 'hidden' : ''}`}>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                                            <span className="text-white font-semibold text-lg">
                                                {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-lg">
                                    <Camera className="w-3 h-3" />
                                </div>
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 backdrop-blur-sm mb-2">
                                    <User className="h-4 w-4 text-blue-400" />
                                    <span className="text-white/70 text-sm font-medium">My Profile</span>
                                </div>
                                <h1 className="headline-lg text-white">{profileData.name || 'Your Profile'}</h1>
                                <p className="text-white/60 text-sm flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4" />
                                    {profileData.email || 'No email provided'}
                                </p>
                                {profileData.username && (
                                    <p className="text-white/60 text-sm flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4" />
                                        @{profileData.username}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <SecondaryButton onClick={() => window.location.href = '/settings'}>
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Edit Profile</span>
                            </SecondaryButton>
                            {profileData.username && (
                                <SecondaryButton onClick={() => window.open(`/profile/${profileData.username}`, '_blank')}>
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="hidden sm:inline">View Public Profile</span>
                                </SecondaryButton>
                            )}
                        </div>
                    </motion.div>
                </SectionCard>

                {/* User Statistics */}
                {userStats && (
                    <SectionCard className="mb-6">
                        <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" /> Your Statistics
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/20 text-blue-300 mx-auto mb-2">
                                    <Folder className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-bold text-white">{userStats.boards.total}</div>
                                <div className="text-xs text-white/60">Total Boards</div>
                            </div>

                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-300 mx-auto mb-2">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-bold text-white">{userStats.collaboration.totalCollaborators}</div>
                                <div className="text-xs text-white/60">Collaborators</div>
                            </div>

                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/20 text-blue-300 mx-auto mb-2">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-bold text-white">{userStats.elements.total}</div>
                                <div className="text-xs text-white/60">Elements Created</div>
                            </div>

                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-600/20 text-amber-300 mx-auto mb-2">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-bold text-white">{userStats.activity.recent}</div>
                                <div className="text-xs text-white/60">Recent Activity</div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Boards Breakdown */}
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-blue-400" />
                                    Boards Breakdown
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-sm">Owned</span>
                                        <span className="text-white font-medium">{userStats.boards.owned}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-sm">Collaborated</span>
                                        <span className="text-white font-medium">{userStats.boards.collaborated}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-sm">Active (7 days)</span>
                                        <span className="text-white font-medium">{userStats.boards.recent}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Collaboration Stats */}
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                                    Collaboration
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-sm">Invitations Sent</span>
                                        <span className="text-white font-medium">{userStats.invitations.sent}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-sm">Acceptance Rate</span>
                                        <span className="text-white font-medium">{userStats.invitations.acceptanceRate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-sm">Avg. Collaborators</span>
                                        <span className="text-white font-medium">{userStats.collaboration.collaborationRate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Profile Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Section */}
                        <SectionCard>
                            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-400" /> About
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] min-h-[100px] flex items-center">
                                    <p className="text-white/80">
                                        {profileData.bio || 'No bio added yet. Visit your settings to add a bio and tell others about yourself.'}
                                    </p>
                                </div>
                                <SecondaryButton
                                    onClick={() => window.location.href = '/settings'}
                                    className="text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Edit in Settings
                                </SecondaryButton>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Information */}
                        <SectionCard>
                            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-400" /> Account Info
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-white/90 mb-2">Account Type</div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-sm font-medium">
                                            Standard Account
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-white/90 mb-2">Member Since</div>
                                    <div className="flex items-center gap-2 text-white/80">
                                        <Calendar className="w-4 h-4 text-white/60" />
                                        <span className="text-sm">{formatDate(profileData.createdAt)}</span>
                                    </div>
                                </div>

                                {profileData.lastLoginAt && (
                                    <div>
                                        <div className="text-sm font-medium text-white/90 mb-2">Last Active</div>
                                        <div className="flex items-center gap-2 text-white/80">
                                            <Activity className="w-4 h-4 text-white/60" />
                                            <span className="text-sm">{getTimeAgo(profileData.lastLoginAt)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Quick Actions */}
                        <SectionCard>
                            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-400" /> Quick Actions
                            </h3>

                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.href = '/settings'}
                                    className="w-full p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.1] text-left transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Settings className="w-4 h-4 text-blue-400" />
                                        <div>
                                            <p className="text-white font-medium text-sm">Account Settings</p>
                                            <p className="text-white/60 text-xs">Manage your account preferences</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-white/40 ml-auto group-hover:text-white/60 transition-colors" />
                                    </div>
                                </button>

                                <button
                                    onClick={() => window.location.href = '/my-boards'}
                                    className="w-full p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.1] text-left transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-blue-400" />
                                        <div>
                                            <p className="text-white font-medium text-sm">My Boards</p>
                                            <p className="text-white/60 text-xs">View and manage your boards</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-white/40 ml-auto group-hover:text-white/60 transition-colors" />
                                    </div>
                                </button>
                            </div>
                        </SectionCard>
                    </div>
                </div>
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
