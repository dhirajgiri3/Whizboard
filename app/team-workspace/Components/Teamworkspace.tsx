"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Settings,
  UserPlus,
  ClipboardList,
  Search,
  X,
  Mail,
  Save,
  Loader2,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar?: string;
  joinedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "member";
  invitedBy: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  expiresAt: string;
}

interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  settings: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
  };
}

interface AuditLog {
  id: string;
  action: string;
  description: string;
  performedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

// Shared UI building blocks (mirrors Settings page styling)
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

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`block w-full rounded-xl border-0 bg-white/[0.05] px-4 py-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200 ${props.className || ""}`}
  />
);

const PrimaryButton = ({ children, className = "", disabled, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button
    {...rest}
    disabled={disabled}
    className={`group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black min-h-[44px] ${className}`}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
  </button>
);

export default function TeamWorkspacePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("members");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState<"admin" | "member">("member");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWorkspaceData();
    }
  }, [status]);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchWorkspace(),
        fetchMembers(),
        fetchInvitations(),
        fetchAuditLogs()
      ]);
    } catch (error) {
      console.error('Error fetching workspace data:', error);
      toast.error('Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspace = async () => {
    const response = await fetch('/api/workspace');
    const data = await response.json();
    if (data.success) {
      setWorkspace(data.workspace);
      setWorkspaceName(data.workspace.name);
    }
  };

  const fetchMembers = async () => {
    const response = await fetch('/api/workspace/members');
    const data = await response.json();
    if (data.success) {
      setMembers(data.members);
    }
  };

  const fetchInvitations = async () => {
    const response = await fetch('/api/workspace/invitations');
    const data = await response.json();
    if (data.success) {
      setInvitations(data.invitations);
    }
  };

  const fetchAuditLogs = async () => {
    const response = await fetch('/api/workspace/audit?limit=10');
    const data = await response.json();
    if (data.success) {
      setAuditLogs(data.logs);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!newInviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInviteEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setInviting(true);
    try {
      const response = await fetch('/api/workspace/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newInviteEmail, role: newInviteRole })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setNewInviteEmail("");
      await fetchInvitations(); // Refresh invitations
      toast.success(`Invitation sent to ${newInviteEmail} as ${newInviteRole}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Remove this member from the workspace?")) return;

    try {
      const response = await fetch('/api/workspace/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member');
      }

      await fetchMembers(); // Refresh members
      toast.success("Member removed successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!confirm("Cancel this invitation?")) return;

    try {
      const response = await fetch('/api/workspace/invitations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel invitation');
      }

      await fetchInvitations(); // Refresh invitations
      toast.success("Invitation cancelled successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const saveWorkspaceSettings = async () => {
    if (!workspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName.trim() })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      await fetchWorkspace(); // Refresh workspace data
      toast.success("Workspace settings saved successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white/70">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70 mb-4">Please sign in to access your workspace</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "members":
        return (
          <SectionCard>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Workspace Members
            </h3>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name or email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-white/50">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="text-sm text-white/80">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-100 flex items-center justify-center font-semibold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{member.name}</div>
                            <div className="text-white/50 text-xs">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{member.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={
                            `px-2 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full border ` +
                            (member.role === "owner"
                              ? "bg-blue-600/20 text-blue-300 border-blue-600/30"
                              : member.role === "admin"
                                ? "bg-emerald-600/20 text-emerald-300 border-emerald-600/30"
                                : "bg-white/5 text-white/70 border-white/10")
                          }
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {member.role !== "owner" && workspace?.ownerId === session?.user?.id && (
                          <button
                            onClick={() => removeMember(member.userId)}
                            className="text-red-300 hover:text-red-200 text-sm hover:underline"
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
          </SectionCard>
        );
      case "invitations":
        return (
          <SectionCard>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" /> Pending Invitations
            </h3>

            <div className="mb-8 p-4 sm:p-6 rounded-xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-medium mb-4">Invite New Member</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={newInviteRole} onChange={(e) => setNewInviteRole(e.target.value as "admin" | "member")}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
              </div>
              <PrimaryButton onClick={handleInvite} disabled={inviting} className="mt-6">
                {inviting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </PrimaryButton>
            </div>

            {invitations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-white/50">
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Invited By</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invitations.map((invite) => (
                      <tr key={invite.id} className="text-sm text-white/80">
                        <td className="px-4 py-3 whitespace-nowrap">{invite.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full border ${invite.role === "admin" ? "bg-blue-600/20 text-blue-300 border-blue-600/30" : "bg-white/5 text-white/70 border-white/10"}`}>
                            {invite.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white/70">{invite.invitedBy}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full border bg-yellow-600/20 text-yellow-300 border-yellow-600/30">
                            {invite.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          {(workspace?.ownerId === session?.user?.id || members.find(m => m.userId === session?.user?.id)?.role === 'admin') && (
                            <button 
                              onClick={() => cancelInvitation(invite.id)} 
                              className="text-red-300 hover:text-red-200 text-sm hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-white/60">
                <Mail className="w-12 h-12 mx-auto mb-3" />
                <p>No pending invitations.</p>
              </div>
            )}
          </SectionCard>
        );
      case "workspace-settings":
        return (
          <SectionCard>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" /> Workspace Settings
            </h3>
            <div className="space-y-6">
              <div>
                <Label>Workspace Name</Label>
                <Input 
                  type="text" 
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name"
                />
              </div>
              <div>
                <Label>Workspace ID</Label>
                <Input 
                  type="text" 
                  value={workspace?.id || ''} 
                  disabled 
                  className="bg-white/[0.02] text-white/50 cursor-not-allowed" 
                />
                <p className="mt-2 text-sm text-white/50">This is a unique identifier for your workspace.</p>
              </div>
              <PrimaryButton onClick={saveWorkspaceSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </PrimaryButton>
            </div>
          </SectionCard>
        );
      case "audit-log":
        return (
          <SectionCard>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-400" /> Audit Log
            </h3>
            <p className="text-white/60 mb-4">View recent activities in your workspace.</p>
            {auditLogs.length > 0 ? (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] text-white/80 text-sm">
                    {log.description} 
                    <span className="text-white/40 text-xs ml-2">
                      {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity to show.</p>
              </div>
            )}
            {auditLogs.length > 0 && (
              <button 
                onClick={() => fetchAuditLogs()}
                className="mt-6 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white text-sm transition-colors inline-flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4" /> Refresh Log
              </button>
            )}
          </SectionCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 pb-16">
      {/* Background accents */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-orb-blue" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 gradient-orb-blue" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <BackButton variant="dark" />
      </div>

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
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-white/70 text-sm font-medium">Team & Workspace</span>
            </div>
            <h1 className="headline-lg text-white">
              {workspace?.name || 'Your Workspace'}
            </h1>
            <p className="body-base text-white/70 max-w-2xl mx-auto">
              Manage members, invitations, and workspace settings for your team.
            </p>
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
                    { id: "members", label: "Members", icon: Users },
                    { id: "invitations", label: "Invitations", icon: UserPlus },
                    { id: "workspace-settings", label: "Workspace Settings", icon: Settings },
                    { id: "audit-log", label: "Audit Log", icon: ClipboardList },
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
              </div>
            </aside>

            {/* Main Panel */}
            <div className="md:col-span-9">{renderContent()}</div>
          </div>
        </div>
      </section>
    </div>
  );
}