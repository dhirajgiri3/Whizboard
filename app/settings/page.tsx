"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
// Using Lucide icons only to align with design preference; remove react-icons dependency
// import { SiGoogledrive, SiSlack, SiFigma } from 'react-icons/si';
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
} from "lucide-react";
import { useSettings } from "@/lib/context/SettingsContext";
import { useAppContext } from "@/lib/context/AppContext";
 
import { toast } from "sonner";

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
    className={`group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] ${className}`}
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
        const response = await fetch('/api/integrations/slack/channels');
        if (response.ok) {
          const data = await response.json();
          setChannels(data.channels || []);
        }
      } catch {
        toast.error('Failed to fetch Slack channels');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSavedChannel = async () => {
      try {
        const response = await fetch('/api/settings/integrations/slack-default-channel');
        if (response.ok) {
          const data = await response.json();
          setSavedChannel(data.defaultChannel);
          if (data.defaultChannel?.id) {
            setSelectedChannel(data.defaultChannel.id);
          }
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
      const response = await fetch('/api/settings/integrations/slack-default-channel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: selectedChannel,
          channelName: channel?.name
        })
      });
      
      if (response.ok) {
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
          {isSaving ? 'Saving...' : 'Save as Default'}
        </button>

        {isLoading && (
          <p className="text-sm text-white/50">Loading channels...</p>
        )}
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, refreshUserProfilePicture } = useAppContext();
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  // Profile image edit states
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/account', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setProfileImageUrl(data?.user?.image || null);
        }
      } catch {}
    })();
  }, []);

  // Show integration connect result notifications from OAuth callbacks
  useEffect(() => {
    const svc = searchParams.get('integrations');
    const status = searchParams.get('status');
    if (!svc || !status) return;
    const name = svc === 'googleDrive' ? 'Google Drive' : svc === 'slack' ? 'Slack' : svc === 'figma' ? 'Figma' : svc;
    if (status === 'connected') {
      toast.success(`${name} connected`);
    } else if (status === 'error') {
      toast.error(`Failed to connect ${name}`);
    }
    // Clean URL without query params
    router.replace('/settings');
  }, [searchParams, router]);

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

      const response = await fetch("/api/settings/account", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        toast.success("Profile image updated successfully", { id: toastId });
        setIsEditingImage(false);
        setSelectedImage(null);
        setImagePreview("");
        setProfileImageUrl(imagePreview);
        // Force refresh globally (header avatar, menus)
        await refreshUserProfilePicture();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update profile image", { id: toastId });
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
      const res = await fetch('/api/settings/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-image' }),
      });
      if (res.ok) {
        setProfileImageUrl(null);
        toast.success('Profile image removed', { id: toastId });
        await refreshUserProfilePicture();
      } else {
        const err = await res.json().catch(() => ({}));
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
      <div className="min-h-screen bg-[var(--deep-canvas)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-white/80 text-sm">Loading settings...</span>
        </div>
      </div>
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
                          {isUploadingImage ? 'Uploading...' : 'Save Image'}
                        </button>
                        <button
                          onClick={handleDeleteProfileImage}
                          disabled={isDeletingImage}
                          className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm border border-red-500/30 transition-colors"
                        >
                          {isDeletingImage ? 'Removing...' : 'Remove'}
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
                  defaultValue={user?.name || ""}
                />
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
                  defaultValue=""
                />
              </div>

              <div className="pt-4">
                <PrimaryButton className="w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  Save Changes
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
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" /> Integrations
            </h3>
            <p className="text-white/60 mb-6">Connect your WhizBoard account with other services.</p>
            
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
                      {key === 'slack' && <Share2 className="w-5 h-5 text-blue-400" />}
                      {key === 'googleDrive' && <ExternalLink className="w-5 h-5 text-green-400" />}
                      {key === 'figma' && <Settings className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div>
                      <h5 className="text-white font-medium capitalize">
                        {key === 'googleDrive' ? 'Google Drive' : key === 'slack' ? 'Slack' : key === 'figma' ? 'Figma' : key}
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
                        const name = key === 'googleDrive' ? 'Google Drive' : key === 'slack' ? 'Slack' : key === 'figma' ? 'Figma' : key;
                        toast.success(`${name} disconnected`);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                      value
                        ? "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                        : "bg-blue-600/20 text-blue-200 border-blue-500/30 hover:bg-blue-600/30"
                    }`}
                  >
                    {value ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}

              {/* Slack Default Channel Setting */}
              {integrations.slack && (
                <div>
                  <SlackChannelPicker />
                  
                  {/* Simple Integration Info */}
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300">
                      <strong>Slack Integration Active</strong>
                      <br />
                      Board creation notifications will be sent to your default channel. 
                      The bot can automatically join channels as needed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        );
      case "security":
        return (
          <SectionCard>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-400" /> Security Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <Label>Account Security</Label>
                <div className="space-y-3">
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
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <h5 className="text-white font-medium">Delete Account</h5>
                      <p className="text-white/60 text-sm">Permanently remove your account and all data</p>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm border border-red-500/30 transition-colors"
                    >
                      Delete
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
    <div className="min-h-screen py-12">
      {/* Header */}
      <section className="pt-16 sm:pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 backdrop-blur-sm mx-auto">
              <User className="h-4 w-4 text-blue-400" />
              <span className="text-white/70 text-sm font-medium">Account Settings</span>
            </div>
            <h1 className="headline-lg text-white">Manage your experience</h1>
            <p className="body-base text-white/70 max-w-2xl mx-auto">Personalize WhizBoard and set your preferences.</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section>
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
                    { id: "security", label: "Security", icon: AlertTriangle },
                    { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center justify-between md:justify-start gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === id
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