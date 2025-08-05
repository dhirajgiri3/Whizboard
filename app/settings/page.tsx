"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  User,
  Shield,
  Bell,
  Palette,
  Share2,
  AlertTriangle,
  ChevronRight,
  Sun,
  Moon,
  ToggleRight,
  ToggleLeft,
  Key,
  Mail,
  Edit,
  Save,
  Trash2,
  LogOut
} from "lucide-react";
import { useSettings } from "@/lib/context/SettingsContext";
import { useAppContext } from "@/lib/context/AppContext";
import { formatDistanceToNow } from 'date-fns';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAppContext();
  const {
    securitySettings,
    updateSecuritySettings,
    enableTwoFactor,
    disableTwoFactor,
    revokeAllSessions,
    revokeSession,
    changePassword,
    notificationSettings,
    updateEmailNotifications,
    updateInAppNotifications,
    displaySettings,
    updateDisplaySettings,
    integrations,
    toggleIntegration,
    deleteAccount,
    exportUserData,
    isLoading,
    error,
    lastUpdated,
  } = useSettings();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }
    if (await changePassword(currentPassword, newPassword)) {
      alert("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowChangePasswordModal(false);
    } else {
      alert(`Failed to change password: ${error}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      if (await deleteAccount(deleteAccountPassword)) {
        alert("Account deleted successfully!");
        // Redirect to logout or home page
      } else {
        alert(`Failed to delete account: ${error}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-slate-700">Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p className="text-xl">Error loading settings: {error}</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Profile Settings</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  defaultValue={user?.name || ""}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled // Assuming name changes are handled elsewhere or not allowed here
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  defaultValue={user?.email || ""}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
                <p className="mt-2 text-sm text-slate-500">Email cannot be changed.</p>
              </div>
              {/* <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                <Save className="w-5 h-5" /> Save Changes
              </button> */}
            </div>
          </motion.div>
        );
      case "security":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Account Security</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Password</h4>
                <p className="text-slate-600 mb-4">Set a unique password to protect your account.</p>
                <button 
                  onClick={() => setShowChangePasswordModal(true)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Key className="w-4 h-4" /> Change Password
                </button>

                {showChangePasswordModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                      <h3 className="text-xl font-bold mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="Current Password"
                          className="w-full px-4 py-2 border rounded-lg"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="w-full px-4 py-2 border rounded-lg"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="mt-6 flex justify-end space-x-4">
                        <button onClick={() => setShowChangePasswordModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button onClick={handlePasswordChange} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Change</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Two-Factor Authentication (2FA)</h4>
                <p className="text-slate-600 mb-4">Add an extra layer of security to your account.</p>
                <button 
                  onClick={securitySettings.twoFactorEnabled ? disableTwoFactor : enableTwoFactor}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  {securitySettings.twoFactorEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {securitySettings.twoFactorEnabled ? " Disable 2FA" : " Enable 2FA"}
                </button>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Active Sessions</h4>
                <p className="text-slate-600 mb-4">Manage devices logged into your account.</p>
                <ul className="space-y-3 mb-4">
                  {securitySettings.activeSessions.map(session => (
                    <li key={session.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-700">{session.device} {session.current && "(Current)"}</p>
                        <p className="text-sm text-slate-500">{session.location} &bull; Last active {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}</p>
                      </div>
                      {!session.current && (
                        <button 
                          onClick={() => revokeSession(session.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={revokeAllSessions}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" /> Revoke All Sessions
                </button>
              </div>
            </div>
          </motion.div>
        );
      case "notifications":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700">Email Notifications</h4>
                {Object.entries(notificationSettings.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                      <p className="text-sm text-slate-600">Receive updates and announcements via email.</p>
                    </div>
                    <button onClick={() => updateEmailNotifications({ [key]: !value })} className="text-blue-600">
                      {value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>
                ))}
              </div>

              {/* In-app Notifications */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700">In-app Notifications</h4>
                {Object.entries(notificationSettings.inApp).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                      <p className="text-sm text-slate-600">Get alerts for real-time activities within the app.</p>
                    </div>
                    <button onClick={() => updateInAppNotifications({ [key]: !value })} className="text-blue-600">
                      {value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case "display":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Display Settings</h3>
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Theme</h4>
                <div className="flex space-x-4">
                  {(['light', 'dark', 'system'] as const).map(themeOption => (
                    <button
                      key={themeOption}
                      onClick={() => updateDisplaySettings({ theme: themeOption })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${displaySettings.theme === themeOption ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                      {themeOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Mode */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Color Mode</h4>
                <div className="flex space-x-4">
                  {(['default', 'colorblind', 'high-contrast'] as const).map(colorModeOption => (
                    <button
                      key={colorModeOption}
                      onClick={() => updateDisplaySettings({ colorMode: colorModeOption })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${displaySettings.colorMode === colorModeOption ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                      {colorModeOption.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Font Size</h4>
                <div className="flex space-x-4">
                  {(['small', 'medium', 'large'] as const).map(fontSizeOption => (
                    <button
                      key={fontSizeOption}
                      onClick={() => updateDisplaySettings({ fontSize: fontSizeOption })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${displaySettings.fontSize === fontSizeOption ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                      {fontSizeOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-700">Reduced Motion</h4>
                  <p className="text-sm text-slate-600">Minimize animations and transitions.</p>
                </div>
                <button onClick={() => updateDisplaySettings({ reducedMotion: !displaySettings.reducedMotion })} className="text-blue-600">
                  {displaySettings.reducedMotion ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>
            </div>
          </motion.div>
        );
      case "integrations":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Integrations</h3>
            <p className="text-slate-600 mb-4">Connect your WhizBoard account with other services.</p>
            <div className="space-y-4">
              {Object.entries(integrations).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-slate-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                    <p className="text-sm text-slate-500">{key === 'googleDrive' && 'Sync your files and documents.'}
                                          {key === 'slack' && 'Get real-time updates in your Slack channels.'}
                                          {key === 'microsoft' && 'Integrate with Microsoft services.'}
                                          {key === 'github' && 'Connect to your GitHub repositories.'}
                                          {key === 'figma' && 'Import designs from Figma.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleIntegration(key as keyof typeof integrations, !value)}
                    className={`px-3 py-1 ${value ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded-full text-sm transition-colors`}
                  >
                    {value ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case "danger-zone":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 p-8 rounded-xl shadow-sm border border-red-200 text-red-800"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Danger Zone
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Delete Account</h4>
                <p className="mb-4">Permanently delete your WhizBoard account and all associated data. This action cannot be undone.</p>
                <input
                  type="password"
                  placeholder="Enter password to confirm"
                  className="w-full px-4 py-2 border rounded-lg mb-4 text-slate-800"
                  value={deleteAccountPassword}
                  onChange={(e) => setDeleteAccountPassword(e.target.value)}
                />
                <button 
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" /> Delete Account
                </button>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Sign Out from All Devices</h4>
                <p className="mb-4">Sign out of your WhizBoard account on all devices you are currently logged into.</p>
                <button 
                  onClick={revokeAllSessions}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
            >
              <User className="w-4 h-4" />
              Settings
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Manage Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Account
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Personalize your WhizBoard experience, manage security, and set your preferences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
              className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit"
            >
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "profile"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <User className="w-5 h-5" /> Profile
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "security"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Shield className="w-5 h-5" /> Security
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "notifications"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Bell className="w-5 h-5" /> Notifications
                </button>
                <button
                  onClick={() => setActiveTab("display")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "display"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Palette className="w-5 h-5" /> Display
                </button>
                <button
                  onClick={() => setActiveTab("integrations")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "integrations"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Share2 className="w-5 h-5" /> Integrations
                </button>
                <button
                  onClick={() => setActiveTab("danger-zone")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "danger-zone"
                      ? "bg-red-500 text-white shadow-md"
                      : "text-red-700 hover:bg-red-50"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </button>
              </nav>
            </motion.div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {renderContent()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 