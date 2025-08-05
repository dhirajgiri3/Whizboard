"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Users,
  PlusCircle,
  Settings,
  UserPlus,
  Trash2,
  Crown,
  ClipboardList,
  Search,
  X,
  Mail,
  User,
  Info,
  Save
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar: string;
}

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "member";
  invitedBy: string;
  status: "pending" | "accepted" | "declined";
}

const sampleMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "owner",
    avatar: "/api/placeholder/100/100",
  },
  {
    id: "2",
    name: "Bob Williams",
    email: "bob@example.com",
    role: "admin",
    avatar: "/api/placeholder/100/100",
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "member",
    avatar: "/api/placeholder/100/100",
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    role: "member",
    avatar: "/api/placeholder/100/100",
  },
];

const sampleInvitations: Invitation[] = [
  {
    id: "inv1",
    email: "new.user@example.com",
    role: "member",
    invitedBy: "Alice Johnson",
    status: "pending",
  },
  {
    id: "inv2",
    email: "manager@example.com",
    role: "admin",
    invitedBy: "Bob Williams",
    status: "pending",
  },
];

export default function TeamWorkspacePage() {
  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState<TeamMember[]>(sampleMembers);
  const [invitations, setInvitations] = useState<Invitation[]>(sampleInvitations);
  const [searchQuery, setSearchQuery] = useState("");
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState<"admin" | "member">("member");

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = () => {
    if (newInviteEmail && newInviteRole) {
      const newInvitation: Invitation = {
        id: `inv${invitations.length + 1}`,
        email: newInviteEmail,
        role: newInviteRole,
        invitedBy: "Current User", // This should be dynamic based on logged-in user
        status: "pending",
      };
      setInvitations([...invitations, newInvitation]);
      setNewInviteEmail("");
      alert(`Invitation sent to ${newInviteEmail} as ${newInviteRole}`);
    }
  };

  const removeMember = (id: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      setMembers(members.filter(member => member.id !== id));
    }
  };

  const cancelInvitation = (id: string) => {
    if (confirm("Are you sure you want to cancel this invitation?")) {
      setInvitations(invitations.filter(inv => inv.id !== id));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "members":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Workspace Members</h3>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {member.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{member.name}</div>
                            <div className="text-sm text-slate-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.role === 'owner' ? 'bg-purple-100 text-purple-800' : member.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {member.role !== 'owner' && (
                          <button
                            onClick={() => removeMember(member.id)}
                            className="text-red-600 hover:text-red-900 ml-4"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      case "invitations":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Pending Invitations</h3>
            <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-xl font-semibold text-slate-800 mb-4">Invite New Member</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="invite-email"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="invite-role" className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    id="invite-role"
                    value={newInviteRole}
                    onChange={(e) => setNewInviteRole(e.target.value as "admin" | "member")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleInvite}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" /> Send Invitation
              </button>
            </div>

            {invitations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invited By</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {invitations.map((invite) => (
                      <tr key={invite.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{invite.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invite.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {invite.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{invite.invitedBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{invite.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => cancelInvitation(invite.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600">
                <Mail className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">No pending invitations.</p>
              </div>
            )}
          </motion.div>
        );
      case "workspace-settings":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Workspace Settings</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="workspace-name" className="block text-sm font-medium text-slate-700 mb-1">Workspace Name</label>
                <input
                  type="text"
                  id="workspace-name"
                  defaultValue="My WhizBoard Team"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="workspace-id" className="block text-sm font-medium text-slate-700 mb-1">Workspace ID</label>
                <input
                  type="text"
                  id="workspace-id"
                  defaultValue="whiz-team-12345"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed"
                  disabled
                />
                <p className="mt-2 text-sm text-slate-500">This is a unique identifier for your workspace.</p>
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                <Save className="w-5 h-5" /> Save Settings
              </button>
            </div>
          </motion.div>
        );
      case "audit-log":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Audit Log</h3>
            <p className="text-slate-600 mb-4">View recent activities in your workspace.</p>
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <p className="text-sm font-medium text-slate-800">John Doe invited Jane Smith to the workspace. <span className="text-slate-500 text-xs">2 hours ago</span></p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <p className="text-sm font-medium text-slate-800">Alice Johnson changed workspace name to 'Creative Hub'. <span className="text-slate-500 text-xs">1 day ago</span></p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <p className="text-sm font-medium text-slate-800">Bob Williams updated his role to 'Admin'. <span className="text-slate-500 text-xs">3 days ago</span></p>
              </div>
            </div>
            <button className="mt-6 px-4 py-2 border border-slate-300 rounded-lg text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> View Full Log
            </button>
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
              <Users className="w-4 h-4" />
              Team & Workspace
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Collaborate with Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Team
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Manage members, invitations, and workspace settings for seamless collaboration.
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
                  onClick={() => setActiveTab("members")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "members"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Users className="w-5 h-5" /> Members
                </button>
                <button
                  onClick={() => setActiveTab("invitations")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "invitations"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <UserPlus className="w-5 h-5" /> Invitations
                </button>
                <button
                  onClick={() => setActiveTab("workspace-settings")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "workspace-settings"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Settings className="w-5 h-5" /> Workspace Settings
                </button>
                <button
                  onClick={() => setActiveTab("audit-log")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                    activeTab === "audit-log"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <ClipboardList className="w-5 h-5" /> Audit Log
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