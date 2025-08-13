"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import {
    User,
    Camera,
    Mail,
    Calendar,
    Shield,
    Activity,
    BarChart3,
    Users,
    Folder,
    Zap,
    MessageSquare,
    Globe,
    ArrowLeft,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '@/components/ui/BackButton';
import api from '@/lib/http/axios';
import { useSession } from 'next-auth/react';

interface PublicProfileData {
    name: string;
    email: string;
    image?: string;
    bio?: string;
    createdAt?: string;
    username: string;
}

interface PublicUserStats {
    boards: {
        total: number;
        public: number;
        private: number;
    };
    collaboration: {
        totalCollaborations: number;
    };
    elements: {
        total: number;
        text: number;
        drawing: number;
        shapes: number;
    };
    profile: {
        totalViews: number;
        uniqueViews: number;
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

export default function PublicProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const { data: session } = useSession();
    
    const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
    const [userStats, setUserStats] = useState<PublicUserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Social interaction states
    const [isFollowing, setIsFollowing] = useState(false);
    const [isCheckingFollow, setIsCheckingFollow] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    
    // Check if viewing own profile
    const isOwnProfile = session?.user?.email && profileData?.email === session.user.email;

    useEffect(() => {
        if (username) {
            fetchPublicProfile();
        }
    }, [username]);

    const fetchPublicProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const { data } = await api.get(`/api/profile/${encodeURIComponent(username)}`);
            setProfileData(data.profile);
            setUserStats(data.stats);
            
            // If user is logged in, check follow status and get follower counts
            if (session?.user?.email) {
                await Promise.all([
                    checkFollowStatus(),
                    getFollowerCounts()
                ]);
            }
        } catch (error: any) {
            console.error('Failed to fetch public profile:', error);
            
            if (error.response?.status === 404) {
                setError('User not found');
            } else if (error.response?.status === 403) {
                setError('This profile is private');
            } else {
                setError('Failed to load profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const checkFollowStatus = async () => {
        try {
            const { data } = await api.get(`/api/profile/follow/status?targetUsername=${username}`);
            setIsFollowing(data.isFollowing);
        } catch (error) {
            console.error('Failed to check follow status:', error);
        }
    };

    const getFollowerCounts = async () => {
        try {
            const [followersRes, followingRes] = await Promise.all([
                api.get(`/api/profile/follow?username=${username}&type=followers`),
                api.get(`/api/profile/follow?username=${username}&type=following`)
            ]);
            
            setFollowerCount(followersRes.data.count || 0);
            setFollowingCount(followingRes.data.count || 0);
        } catch (error) {
            console.error('Failed to get follower counts:', error);
        }
    };

    const handleFollowToggle = async () => {
        try {
            setIsCheckingFollow(true);
            const action = isFollowing ? 'unfollow' : 'follow';
            
            const { data } = await api.post('/api/profile/follow', {
                targetUsername: username,
                action
            });
            
            if (data.success) {
                setIsFollowing(!isFollowing);
                toast.success(data.message);
                
                // Refresh follower counts
                await getFollowerCounts();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update follow status');
        } finally {
            setIsCheckingFollow(false);
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

    if (error) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-gray-950 pt-32">
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-orb-blue" />
                <div className="absolute bottom-1/3 right-1/4 w-60 h-60 gradient-orb-blue" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center max-w-md mx-auto px-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">{error}</h2>
                        <p className="text-white/60 text-sm mb-6">
                            {error === 'User not found' 
                                ? 'The user you\'re looking for doesn\'t exist or may have changed their username.'
                                : error === 'This profile is private'
                                ? 'This user has chosen to keep their profile private.'
                                : 'Something went wrong while loading the profile. Please try again later.'
                            }
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData || !userStats) {
        return null;
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gray-950 pb-16 pt-32">
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
                        label="Back"
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
                                            alt={`${profileData.name}'s profile`}
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
                                <div className="absolute -bottom-1 -right-1 p-1.5 bg-green-600 text-white rounded-lg">
                                    <Globe className="w-3 h-3" />
                                </div>
                            </div>
                            
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 backdrop-blur-sm mb-2">
                                    <Globe className="h-4 w-4 text-green-400" />
                                    <span className="text-white/70 text-sm font-medium">Public Profile</span>
                                </div>
                                <h1 className="headline-lg text-white">{profileData.name}</h1>
                                <p className="text-white/60 text-sm flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4" />
                                    @{profileData.username}
                                </p>
                                <p className="text-white/60 text-sm flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4" />
                                    {profileData.email}
                                </p>
                                {profileData.bio && (
                                    <p className="text-white/70 text-sm mt-2 max-w-md">
                                        {profileData.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Social Interaction Buttons - Only show if not own profile */}
                        {!isOwnProfile && session?.user?.email && (
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={isCheckingFollow}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                                        isFollowing
                                            ? 'bg-white/[0.1] hover:bg-white/[0.15] text-white border border-white/[0.2]'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    {isCheckingFollow ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Users className="w-4 h-4" />
                                    )}
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        )}

                        {/* Follower/Following Counts */}
                        <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>{followerCount} followers</span>
                            <span>{followingCount} following</span>
                        </div>
                    </motion.div>
                </SectionCard>

                {/* User Statistics */}
                <SectionCard className="mb-6">
                    <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" /> Statistics
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
                            <div className="text-2xl font-bold text-white">{userStats.collaboration.totalCollaborations}</div>
                            <div className="text-xs text-white/60">Collaborations</div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/20 text-blue-300 mx-auto mb-2">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-bold text-white">{userStats.elements.total}</div>
                            <div className="text-xs text-white/60">Elements Created</div>
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
                                    <span className="text-white/70 text-sm">Public</span>
                                    <span className="text-white font-medium">{userStats.boards.public}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Private</span>
                                    <span className="text-white font-medium">{userStats.boards.private}</span>
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
                                    <span className="text-white/70 text-sm">Total Collaborations</span>
                                    <span className="text-white font-medium">{userStats.collaboration.totalCollaborations}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Avg. per Board</span>
                                    <span className="text-white font-medium">{userStats.boards.total ? (userStats.collaboration.totalCollaborations / userStats.boards.total).toFixed(1) : '0.0'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Profile Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Section */}
                        <SectionCard>
                            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-400" /> About
                            </h3>

                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] min-h-[100px] flex items-center">
                                <p className="text-white/80">
                                    {profileData.bio || 'This user hasn\'t added a bio yet.'}
                                </p>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Information */}
                        <SectionCard>
                            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-400" /> Profile Info
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-white/90 mb-2">Account Type</div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1.5 rounded-lg bg-green-600/20 text-green-300 border border-green-500/30 text-sm font-medium">
                                            Public Profile
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
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>


        </div>
    );
}