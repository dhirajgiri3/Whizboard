"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// Using Lucide icons only to align with design preference; remove react-icons dependency
// import { SiGoogledrive, SiSlack } from 'react-icons/si';
import {
  User,
  Bell,
  Share2,
  AlertTriangle,
  Camera,
  Save,
  X,
  Settings,
  ExternalLink,
  Lock,
  FolderOpen
} from "lucide-react";
import { useSettings } from "@/lib/context/SettingsContext";
import { useAppContext } from "@/lib/context/AppContext";
import api from '@/lib/http/axios';

import { toast } from "sonner";
import BackButton from "@/components/ui/BackButton";
import Loading, { LoadingOverlay } from "@/components/ui/loading/Loading";

// Hoisted stateless UI building blocks to keep component identity stable between renders
const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors backdrop-blur-sm ${className}`}
  >
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-white/90 mb-2">{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`block w-full rounded-xl border-0 bg-white/[0.05] px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200 ${props.className || ""}`}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`block w-full rounded-xl border-0 bg-white/[0.05] px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200 ${props.className || ""}`}
  />
);

const PrimaryButton = ({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button
    {...rest}
    className={`group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black min-h-[44px] ${className}`}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
  </button>
);



// Slack Channel Picker Component
const SlackChannelPicker = () => {
  const [channels, setChannels] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [savedChannel, setSavedChannel] = useState<{ id: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/api/integrations/slack/channels');
        setChannels(data.channels || []);
      } catch {
        toast.error('Failed to fetch Slack channels');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSavedChannel = async () => {
      try {
        const { data } = await api.get('/api/settings/integrations/slack-default-channel');
        setSavedChannel(data.defaultChannel);
        if (data.defaultChannel?.id) {
          setSelectedChannel(data.defaultChannel.id);
        }
      } catch {
        toast.error('Failed to fetch saved channel');
      }
    };

    fetchChannels();
    fetchSavedChannel();
  }, []);

  const handleSaveChannel = async () => {
    if (!selectedChannel) return;

    setIsSaving(true);
    try {
      const channel = channels.find(c => c.id === selectedChannel);
      const response = await api.put('/api/settings/integrations/slack-default-channel', {
        channelId: selectedChannel,
        channelName: channel?.name
      });
      if (response.status >= 200 && response.status < 300) {
        setSavedChannel({ id: selectedChannel, name: channel?.name });
        toast.success('Default Slack channel updated successfully');
      } else {
        toast.error('Failed to update default channel');
      }
    } catch {
      toast.error('Failed to update default channel');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-white mb-1">Default Slack Channel</h4>
      <p className="text-sm text-white/60">
        Choose the default channel where Slack notifications will be sent.
      </p>

      {savedChannel && (
        <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
          <p className="text-sm text-white/70">
            Current default: <strong>#{savedChannel.name || 'Unknown'}</strong>
          </p>
        </div>
      )}

      <div className="flex gap-3 items-center">
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="flex-1 rounded-xl border-0 bg-white/[0.05] px-4 py-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200"
          disabled={isLoading}
        >
          <option value="">Select a channel...</option>
          {channels.map(channel => (
            <option key={channel.id} value={channel.id}>
              #{channel.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSaveChannel}
          disabled={isSaving || !selectedChannel}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <Loading size="sm" variant="dots" tone="dark" />
              Saving…
            </span>
          ) : (
            'Save as Default'
          )}
        </button>

        {isLoading && (
          <div className="flex items-center gap-2">
            <Loading size="sm" variant="dots" text="Loading channels" tone="dark" />
          </div>
        )}
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, setUser, refreshUserProfilePicture } = useAppContext();
  const {
    integrations,
    toggleIntegration,
    notificationPrefs,
    setNotificationPrefs,
    saveNotificationPrefs,
    deleteAccount,
    isBootstrapping,
    error,
  } = useSettings();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [originalUsername, setOriginalUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [isPublicProfile, setIsPublicProfile] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  
  // Username availability checking
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string>("");

  // Integrations helpers (Slack + Drive)
  const [slackDefaultChannel, setSlackDefaultChannel] = useState<{ id: string; name?: string } | null>(null);

  // Profile image edit states
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/settings/account', { headers: { 'Cache-Control': 'no-store' } });
        const account = data?.user || {};
        // Use database image if available, otherwise fall back to Google profile image from session
        setProfileImageUrl(account.image || user?.avatar || null);
        setDisplayName(account.name || user?.name || "");
        setUsername(account.username || "");
        setOriginalUsername(account.username || "");
        setBio(account.bio || "");
        setIsPublicProfile(account.isPublicProfile !== false);
      } catch { }
    })();
  }, [user?.name, user?.avatar]);

  // Username availability checking
  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck === originalUsername) {
      setUsernameStatus('idle');
      setUsernameError("");
      return;
    }

    // Basic validation
    if (usernameToCheck.length < 3) {
      setUsernameStatus('invalid');
      setUsernameError("Username must be at least 3 characters long");
      return;
    }

    if (usernameToCheck.length > 30) {
      setUsernameStatus('invalid');
      setUsernameError("Username must be less than 30 characters");
      return;
    }

    if (!/^[a-zA-Z0-9._]+$/.test(usernameToCheck)) {
      setUsernameStatus('invalid');
      setUsernameError("Username can only contain letters, numbers, dots, and underscores");
      return;
    }

    if (/^[._]/.test(usernameToCheck) || /[._]$/.test(usernameToCheck)) {
      setUsernameStatus('invalid');
      setUsernameError("Username cannot start or end with a dot or underscore");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameStatus('checking');
    setUsernameError("");

    try {
      const response = await api.post('/api/profile/check-username', { username: usernameToCheck });
      if (response.data.available) {
        setUsernameStatus('available');
        setUsernameError("");
      } else {
        setUsernameStatus('taken');
        setUsernameError("This username is already taken");
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        setUsernameStatus('invalid');
        setUsernameError(error.response.data.error);
      } else {
        setUsernameStatus('invalid');
        setUsernameError("Failed to check username availability");
      }
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Debounced username checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  // Show integration connect result notifications from OAuth callbacks
  useEffect(() => {
    // Respect tab query parameter to open a specific settings tab (e.g., ?tab=integrations)
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const allowed = ['profile', 'notifications', 'integrations', 'security', 'danger-zone'];
      if (allowed.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }

    const svc = searchParams.get('integrations');
    const status = searchParams.get('status');
    if (!svc || !status) return;
    const name = svc === 'googleDrive' ? 'Google Drive' : svc === 'slack' ? 'Slack' : svc;
    if (status === 'connected') {
      toast.success(`${name} connected`);
    } else if (status === 'error') {
      toast.error(`Failed to connect ${name}`);
    }
    // Clean URL without query params
    router.replace('/settings');
  }, [searchParams, router]);

  // Load Slack default channel when Integrations tab is active and Slack is connected
  useEffect(() => {
    const loadDefault = async () => {
      try {
        const { data } = await api.get('/api/settings/integrations/slack-default-channel', { headers: { 'Cache-Control': 'no-store' } });
        setSlackDefaultChannel(data?.defaultChannel || null);
      } catch { }
    };
    if (activeTab === 'integrations' && integrations.slack) {
      loadDefault();
    }
  }, [activeTab, integrations.slack]);

  const refreshSlackDefault = async () => {
    try {
      const { data } = await api.get('/api/settings/integrations/slack-default-channel', { headers: { 'Cache-Control': 'no-store' } });
      setSlackDefaultChannel(data?.defaultChannel || null);
      toast.success('Refreshed');
    } catch {
      toast.error('Failed to refresh');
    }
  };



  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      if (await deleteAccount()) {
        toast.success("Account deleted successfully!");
        // Redirect handled elsewhere
      } else {
        toast.error(`Failed to delete account: ${error}`);
      }
    }
  };

  // Profile image edit functions
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setIsEditingImage(true);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      setIsUploadingImage(true);
      const toastId = 'profile-image-upload';
      toast.loading('Uploading image…', { id: toastId });
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await api.put("/api/settings/account", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.status >= 200 && response.status < 300) {
        toast.success("Profile image updated successfully", { id: toastId });
        setIsEditingImage(false);
        setSelectedImage(null);
        setImagePreview("");
        setProfileImageUrl(imagePreview);
        // Force refresh globally (header avatar, menus)
        await refreshUserProfilePicture();
      } else {
        const data = (response.data as any) || {};
        toast.error(data.message || "Failed to update profile image", { id: toastId });
      }
    } catch {
      toast.error("Failed to update profile image", { id: 'profile-image-upload' });
    }
    finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    try {
      setIsDeletingImage(true);
      const toastId = 'profile-image-delete';
      toast.loading('Removing image…', { id: toastId });
      const res = await api.delete('/api/settings/account', { data: { action: 'delete-image' } });
      if (res.status >= 200 && res.status < 300) {
        setProfileImageUrl(null);
        toast.success('Profile image removed', { id: toastId });
        await refreshUserProfilePicture();
      } else {
        const err = (res.data as any) || {};
        toast.error(err.error || 'Failed to remove image', { id: toastId });
      }
    } catch {
      toast.error('Failed to remove image', { id: 'profile-image-delete' });
    }
    finally {
      setIsDeletingImage(false);
    }
  };

  const handleCancelImageEdit = () => {
    setIsEditingImage(false);
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // — hoisted UI components are defined at module scope above —

  // Prevent full-page flicker only during initial bootstrapping fetch
  if (isBootstrapping) {
    return (
      <LoadingOverlay
        text="Loading settings"
        subtitle="Fetching your preferences and integrations"
        variant="collaboration"
        theme="dark"
      />
    );
  }

  // Show non-blocking error banner if mutations fail; only block during bootstrapping handled above

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <SectionCard>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> Profile Settings
            </h3>

            <div className="space-y-6">
              {/* Profile Image */}
              <div>
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-white/[0.05] border-2 border-white/[0.1] overflow-hidden">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Profile preview"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : profileImageUrl ? (
                        <Image
                          src={profileImageUrl}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                    </div>
                    {isEditingImage && (
                      <button
                        onClick={handleCancelImageEdit}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      {isEditingImage ? 'Change Image' : 'Upload Image'}
                    </label>

                    {isEditingImage && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={handleImageUpload}
                          disabled={isUploadingImage}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm transition-colors"
                        >
                          {isUploadingImage ? (
                            <span className="inline-flex items-center gap-2">
                              <Loading size="sm" variant="dots" tone="dark" />
                              Uploading…
                            </span>
                          ) : (
                            'Save Image'
                          )}
                        </button>
                        <button
                          onClick={handleDeleteProfileImage}
                          disabled={isDeletingImage}
                          className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm border border-red-500/30 transition-colors"
                        >
                          {isDeletingImage ? (
                            <span className="inline-flex items-center gap-2">
                              <Loading size="sm" variant="dots" tone="dark" />
                              Removing…
                            </span>
                          ) : (
                            'Remove'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div>
                <Label>Display Name</Label>
                <Input
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div>
                <Label>Username</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`${
                      usernameStatus === 'available' ? 'ring-green-500' :
                      usernameStatus === 'taken' ? 'ring-red-500' :
                      usernameStatus === 'invalid' ? 'ring-red-500' :
                      usernameStatus === 'checking' ? 'ring-yellow-500' :
                      'ring-white/10'
                    }`}
                  />
                  {usernameStatus === 'checking' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loading size="sm" variant="dots" tone="dark" />
                    </div>
                  )}
                  {usernameStatus === 'available' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {usernameStatus === 'taken' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Username status messages */}
                {usernameStatus === 'available' && (
                  <p className="mt-2 text-sm text-green-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Username is available
                  </p>
                )}
                
                {usernameStatus === 'taken' && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {usernameError}
                  </p>
                )}
                
                {usernameStatus === 'invalid' && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {usernameError}
                  </p>
                )}
                
                {usernameStatus === 'checking' && (
                  <p className="mt-2 text-sm text-yellow-400 flex items-center gap-2">
                    <Loading size="sm" variant="dots" tone="dark" />
                    Checking availability...
                  </p>
                )}
                
                <p className="mt-2 text-sm text-white/50">
                  Your username will be used in your profile URL: /profile/{username || 'username'}
                </p>
              </div>

              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-white/[0.02] text-white/60 cursor-not-allowed"
                />
                <p className="mt-2 text-sm text-white/50">Email cannot be changed.</p>
              </div>

              <div>
                <Label>Bio</Label>
                <TextArea
                  placeholder="Tell us about yourself..."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Public Profile Toggle */}
              <div>
                <Label>Public Profile</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <h5 className="text-white font-medium">Make Profile Public</h5>
                      <p className="text-white/60 text-sm">
                        Allow others to view your profile at /profile/{username || 'username'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPublicProfile(!isPublicProfile)}
                      aria-pressed={isPublicProfile}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublicProfile ? 'bg-blue-600' : 'bg-white/[0.1]'} hover:bg-white/[0.15]`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublicProfile ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  {isPublicProfile && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-300">
                        <strong>Public Profile Active</strong>
                        <br />
                        Your profile is visible to everyone. You can share your profile URL with others.
                      </p>
                    </div>
                  )}
                  
                  {!isPublicProfile && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <p className="text-sm text-orange-300">
                        <strong>Private Profile</strong>
                        <br />
                        Your profile is private and only visible to you. Others cannot view your profile.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <PrimaryButton
                  onClick={async () => {
                    // Validate username before saving
                    if (username !== originalUsername) {
                      if (usernameStatus !== 'available') {
                        toast.error('Please choose a valid and available username');
                        return;
                      }
                    }
                    
                    try {
                      setIsSavingProfile(true);
                      const res = await api.put('/api/settings/account', { name: displayName, username, bio, isPublicProfile });
                      if (res.status >= 200 && res.status < 300) {
                        toast.success('Profile updated successfully');
                        // Update original username after successful save
                        setOriginalUsername(username);
                        // Optimistically update global user name
                        setUser(user ? { ...user, name: displayName } : user);
                      } else {
                        toast.error('Failed to update profile');
                      }
                    } catch (error: any) {
                      if (error.response?.data?.error) {
                        toast.error(error.response.data.error);
                      } else {
                        toast.error('Failed to update profile');
                      }
                    } finally {
                      setIsSavingProfile(false);
                    }
                  }}
                  className="w-full sm:w-auto"
                  disabled={isSavingProfile || (username !== originalUsername && usernameStatus !== 'available')}
                >
                  <Save className="w-4 h-4" />
                  {isSavingProfile ? 'Saving…' : 'Save Changes'}
                </PrimaryButton>
              </div>
            </div>
          </SectionCard>
        );
      case "notifications":
        return (
          <SectionCard>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" /> Notification Preferences
            </h3>

            <div className="space-y-6">
              <div>
                <Label>Email Notifications</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <h5 className="text-white font-medium">Board Invitations</h5>
                      <p className="text-white/60 text-sm">Get notified when someone invites you to collaborate</p>
                    </div>
                    <button
                      onClick={() => setNotificationPrefs({ email: { boardInvitations: !notificationPrefs.email.boardInvitations } })}
                      aria-pressed={notificationPrefs.email.boardInvitations}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationPrefs.email.boardInvitations ? 'bg-blue-600' : 'bg-white/[0.1]'} hover:bg-white/[0.15]`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationPrefs.email.boardInvitations ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <h5 className="text-white font-medium">Activity Updates</h5>
                      <p className="text-white/60 text-sm">Receive updates about board activity and changes</p>
                    </div>
                    <button
                      onClick={() => setNotificationPrefs({ email: { activityUpdates: !notificationPrefs.email.activityUpdates } })}
                      aria-pressed={notificationPrefs.email.activityUpdates}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationPrefs.email.activityUpdates ? 'bg-blue-600' : 'bg-white/[0.1]'} hover:bg-white/[0.15]`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationPrefs.email.activityUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <h5 className="text-white font-medium">Weekly Digest</h5>
                      <p className="text-white/60 text-sm">Get a summary of your weekly activity</p>
                    </div>
                    <button
                      onClick={() => setNotificationPrefs({ email: { weeklyDigest: !notificationPrefs.email.weeklyDigest } })}
                      aria-pressed={notificationPrefs.email.weeklyDigest}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationPrefs.email.weeklyDigest ? 'bg-blue-600' : 'bg-white/[0.1]'} hover:bg-white/[0.15]`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationPrefs.email.weeklyDigest ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Slack Notifications</Label>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                    <p className="text-white/60 text-sm mr-4">
                      {integrations.slack
                        ? "Slack notifications are enabled for board creation and updates."
                        : "Connect your Slack workspace to receive real-time notifications."
                      }
                    </p>
                    <button
                      disabled={!integrations.slack}
                      onClick={() => setNotificationPrefs({ slack: { boardEvents: !notificationPrefs.slack.boardEvents } })}
                      aria-pressed={notificationPrefs.slack.boardEvents}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationPrefs.slack.boardEvents ? 'bg-blue-600' : 'bg-white/[0.1]'} hover:bg-white/[0.15] disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationPrefs.slack.boardEvents ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <PrimaryButton
                  onClick={async () => {
                    const ok = await saveNotificationPrefs();
                    if (ok) toast.success('Notification preferences saved');
                    else toast.error('Failed to save notification preferences');
                  }}
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </PrimaryButton>
              </div>
            </div>
          </SectionCard>
        );
      case "integrations":
        return (
          <SectionCard>
            <div className="flex flex-col gap-1 mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-1">
                <Share2 className="w-5 h-5 text-blue-400" /> Integrations
              </h3>
              <p className="text-white/60">Connect your WhizBoard account with other services.</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium mb-1">Available Integrations</h4>
                  <p className="text-white/70 text-sm">
                    Connect your favorite tools and services to enhance your workflow.
                  </p>
                </div>
              </div>

              {Object.entries(integrations).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                      {key === 'slack' && (
                        <Image
                          src="/images/logos/slack.svg"
                          alt="Slack logo"
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      {key === 'googleDrive' && (
                        <Image
                          src="/images/logos/google-drive.svg"
                          alt="Google Drive logo"
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain"
                        />
                      )}

                    </div>
                    <div>
                      <h5 className="text-white font-medium capitalize">
                        {key === 'googleDrive' ? 'Google Drive' : key === 'slack' ? 'Slack' : key}
                      </h5>
                      <p className="text-white/60 text-sm">
                        {value ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      const enable = !value;
                      if (enable) {
                        toast.message('Redirecting to connect…');
                      }
                      await toggleIntegration(key as keyof typeof integrations, enable);
                      if (!enable) {
                        const name = key === 'googleDrive' ? 'Google Drive' : key === 'slack' ? 'Slack' : key;
                        toast.success(`${name} disconnected`);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${value
                        ? "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                        : "bg-blue-600/20 text-blue-200 border-blue-500/30 hover:bg-blue-600/30"
                      }`}
                  >
                    {value ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}

              {/* Slack: Default Channel */}
              {integrations.slack && (
                <div className="space-y-4">
                  <SlackChannelPicker />

                  <div className="mt-1 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300">
                      <strong>Slack Integration Active</strong>
                      <br />
                      Board creation notifications will be sent to your default channel. The bot can join channels as needed.
                    </p>
                  </div>
                </div>
              )}

              {/* Google Drive Dashboard Link */}
              {integrations.googleDrive && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-3">
                    <FolderOpen className="w-4 h-4 text-blue-300" />
                    <h6 className="text-white/90 text-sm font-medium">Open Drive Dashboard</h6>
                  </div>
                  <Link href="/google-drive" className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] text-white text-sm border border-white/[0.08]">
                    Open Google Drive
                  </Link>
                  <p className="mt-2 text-xs text-white/50">Manage files linked with your WhizBoard account.</p>
                </div>
              )}
            </div>
          </SectionCard>
        );

      case "security":
        return (
          <SectionCard>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" /> Security Settings
            </h3>

            <div className="space-y-6">
              <div>
                <Label>Password & Authentication</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <h5 className="text-white font-medium">Change Password</h5>
                      <p className="text-white/60 text-sm">Update your account password</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white text-sm border border-white/[0.1] transition-colors">
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <h5 className="text-white font-medium">Two-Factor Authentication</h5>
                      <p className="text-white/60 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm border border-blue-500/30 transition-colors">
                      Enable
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <h5 className="text-white font-medium">Active Sessions</h5>
                      <p className="text-white/60 text-sm">Manage your active login sessions</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white text-sm border border-white/[0.1] transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Data & Privacy</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <h5 className="text-white font-medium">Export Data</h5>
                      <p className="text-white/60 text-sm">Download a copy of your data</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white text-sm border border-white/[0.1] transition-colors">
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        );
      case "danger-zone":
        return (
          <SectionCard className="border-red-500/20">
            <h3 className="text-xl font-semibold mb-6 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Danger Zone
            </h3>

            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <h4 className="text-red-300 font-medium mb-2">Delete Account</h4>
                <p className="text-red-300/80 text-sm mb-4">
                  This action will permanently delete your account and all associated data.
                  This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </SectionCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 py-16">
      {/* Background accents */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-orb-blue" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 gradient-orb-blue" />

      {/* Header */}
      <section className="pt-14 pb-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 backdrop-blur-sm mx-auto">
              <Settings className="h-4 w-4 text-blue-400" />
              <span className="text-white/70 text-sm font-medium">Settings</span>
            </div>
            <h1 className="headline-lg text-white">Manage your account</h1>
            <p className="body-base text-white/70 max-w-2xl mx-auto">Customize your profile, notifications, integrations, and security preferences.</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {/* Sidebar Navigation */}
            <aside className="md:col-span-3">
              <div className="sticky top-24">
                <nav className="flex md:flex-col gap-2">
                  {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "notifications", label: "Notifications", icon: Bell },
                    { id: "integrations", label: "Integrations", icon: Share2 },
                    { id: "security", label: "Security", icon: Lock },
                    { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center justify-between md:justify-start gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === id
                          ? "bg-blue-600 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/[0.05]"
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        {label}
                      </span>
                    </button>
                  ))}
                </nav>
                {/* Advanced Settings entry (navigates to dedicated page) */}
                <div className="mt-3">
                  <Link
                    href="/settings/advanced"
                    className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors text-white/80 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
                    aria-label="Open Advanced Settings"
                  >
                    <span className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-blue-400" />
                      Advanced Settings
                    </span>
                    <ExternalLink className="w-4 h-4 text-white/60" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Panel */}
            <div className="md:col-span-9">
              {renderContent()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 