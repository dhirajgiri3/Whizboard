"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RequireAuth } from "@/components/auth/ProtectedRoute";
import {
  UserPlus2,
  ExternalLink,
  Plus,
  Users,
  Search,
  Grid3X3,
  List,
  Clock,
  MoreHorizontal,
  Folder,
  SortAsc,
  TrendingUp,
  Activity,
  BarChart3,
  Zap,
  ArrowRight,
  ChevronDown,
  RefreshCw,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading/Loading";
import dynamic from "next/dynamic";

// Lazy load heavy modal components
const InviteCollaboratorsModal = dynamic(() => import("@/components/ui/modal/InviteCollaboratorsModal"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-white/10 rounded-lg h-96" />
});

const CreateBoardModal = dynamic(() => import("@/components/ui/modal/CreateBoardModal"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-white/10 rounded-lg h-96" />
});

const SuccessModal = dynamic(() => import("@/components/ui/modal/SuccessModal"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-white/10 rounded-lg h-96" />
});

const GET_MY_BOARDS = gql`
  query GetMyBoards {
    myBoards {
      id
      name
      createdAt
      updatedAt
      collaborators {
        id
        name
        email
      }
    }
  }
`;

const GET_BOARD_USAGE = gql`
  query GetBoardUsage {
    myBoardUsage {
      currentBoardCount
      plan
      boardLimit
      canCreateMore
      usagePercentage
    }
  }
`;

const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!) {
    createBoard(name: $name) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

type Board = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  collaborators?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
};

type ViewMode = "grid" | "list";
type SortBy = "name" | "created" | "updated" | "collaborators";

const MyBoardsPage = () => {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_MY_BOARDS, {
    errorPolicy: "all",
    fetchPolicy: "cache-first", // Use cache first to avoid redundant requests
    onError: (error) => {
      console.error("Error fetching my boards:", error);
      console.error("Error details:", error.message);
      if (error.graphQLErrors) {
        console.error("GraphQL errors:", error.graphQLErrors);
      }
    },
  });

  // Load board usage in parallel, not waiting for boards
  const { data: boardUsageData } = useQuery(GET_BOARD_USAGE, {
    errorPolicy: "all",
    fetchPolicy: "cache-first",
    onError: (error) => {
      console.error("Error fetching board usage:", error);
    },
  });

  const [createBoard, { loading: creating }] = useMutation(CREATE_BOARD, {
    onError: (error) => {
      console.error("Error creating board:", error);
      if (error.message?.includes("maximum number of boards")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create board. Please try again.");
      }
    },
  });

  // State management
  const [newBoardName, setNewBoardName] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBoard, setCreatedBoard] = useState<{ id: string; name: string } | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
            e.preventDefault();
            setShowCreateModal(true);
            break;
          case "k":
            e.preventDefault();
            document.getElementById("search-input")?.focus();
            break;
          case "r":
            e.preventDefault();
            handleRefresh();
            break;
        }
      }
      if (e.key === "Escape") {
        setShowCreateModal(false);
        setShowInviteModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Simplified filtering and sorting
  const getFilteredAndSortedBoards = () => {
    if (!data?.myBoards) return [];

    let boards = data.myBoards;

    // Filter by search query
    if (searchQuery) {
      boards = boards.filter((board: Board) =>
        board.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort boards
    boards.sort((a: Board, b: Board) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "collaborators":
          return (
            (b.collaborators?.length || 0) - (a.collaborators?.length || 0)
          );
        case "updated":
        default:
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
      }
    });

    return boards;
  };

  const filteredAndSortedBoards = getFilteredAndSortedBoards();

  // Reset page on search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBoards.length / pageSize));

  const paginatedBoards = (() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedBoards.slice(start, start + pageSize);
  })();

  // Simplified board statistics - calculate only when needed
  const getBoardStats = () => {
    if (!data?.myBoards) return null;

    const boards = data.myBoards;
    const totalBoards = boards.length;
    const totalCollaborators = boards.reduce(
      (acc: number, board: Board) => acc + (board.collaborators?.length || 0),
      0
    );
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentBoards = boards.filter((board: Board) => {
      const updatedAt = new Date(board.updatedAt || 0).getTime();
      return updatedAt > weekAgo;
    }).length;

    return {
      total: totalBoards,
      collaborators: totalCollaborators,
      recent: recentBoards,
      average:
        totalBoards > 0
          ? Math.round((totalCollaborators / totalBoards) * 10) / 10
          : 0,
    };
  };

  const handleCreateBoard = async () => {
    if (newBoardName.trim() !== "") {
      try {
        await createBoard({ variables: { name: newBoardName } });
        setNewBoardName("");
        setShowCreateModal(false);
        refetch();
        toast.success("Board created successfully!");
      } catch (err) {
        console.error("Error creating board:", err);
        toast.error("Failed to create board");
      }
    }
  };

  const handleBoardCreated = (board: { id: string; name: string }) => {
    setCreatedBoard({ id: board.id, name: board.name });
    setShowCreateModal(false);
    setShowSuccessModal(true);
    refetch();
  };

  const inviteToBoard = (board: Board) => {
    setSelectedBoard(board);
    setShowInviteModal(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Boards refreshed");
    } catch (err) {
      toast.error("Failed to refresh boards");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const getActivityLevel = (board: Board) => {
    if (!board.updatedAt) return "low";
    const now = new Date();
    const updated = new Date(board.updatedAt);
    const diffInDays = Math.floor(
      (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays <= 1) return "high";
    if (diffInDays <= 7) return "medium";
    return "low";
  };

  const getActivityColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "medium":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "low":
        return "bg-white/5 text-white/60 border-white/10";
      default:
        return "bg-white/5 text-white/60 border-white/10";
    }
  };

  // Loading state
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingOverlay text="Loading boards" subtitle="Fetching your boards" variant="collaboration" theme="dark" />
      </div>
    );

  // Error state
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-red-300/80 text-sm mb-6 break-words">{error.message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm border border-white/10 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );

  // Minimal, reusable UI building blocks (aligned with settings page)
  const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors backdrop-blur-sm ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );

  const PrimaryButton = ({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button
      {...rest}
      className={`group relative overflow-hidden bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black min-h-[44px] ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </button>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 pb-16 pt-32">
      {/* Background accents aligned with settings page */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-orb-blue" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 gradient-orb-blue" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="pb-6" aria-labelledby="my-boards-heading" role="region">
          <SectionCard className="mb-0">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 backdrop-blur-sm mb-2">
                    <Users className="h-4 w-4 text-blue-400" aria-hidden="true" />
                    <span className="text-white/70 text-sm font-medium">Boards</span>
                  </div>
                  <h1 id="my-boards-heading" className="headline-lg text-white">My Boards</h1>
                  <p className="text-white/60 text-sm">
                    {data?.myBoards?.length || 0} total
                    <span className="hidden md:inline"> · Manage and organize your boards</span>
                  </p>
                  <p className="hidden md:block text-xs text-white/50 mt-1">Tip: Press Ctrl+N to create a new board</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Board Usage Indicator */}
                {boardUsageData?.myBoardUsage && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm">
                    <span className="text-white/70">Boards:</span>
                    <span className="font-medium text-white">
                      {boardUsageData.myBoardUsage.currentBoardCount}/{boardUsageData.myBoardUsage.boardLimit}
                    </span>
                    {!boardUsageData.myBoardUsage.canCreateMore && (
                      <span className="text-orange-400 text-xs">Limit reached</span>
                    )}
                  </div>
                )}
                
                <PrimaryButton 
                  onClick={() => setShowCreateModal(true)} 
                  aria-label="Create new board"
                  disabled={boardUsageData?.myBoardUsage && !boardUsageData.myBoardUsage.canCreateMore}
                  className={boardUsageData?.myBoardUsage && !boardUsageData.myBoardUsage.canCreateMore ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Plus className="w-4 h-4" /> New Board
                </PrimaryButton>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  aria-label="Refresh boards"
                  title="Refresh (Ctrl+R)"
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] disabled:opacity-50 border border-white/[0.1] text-white/80 text-sm flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={() => setShowStats(!showStats)}
                  aria-pressed={showStats}
                  aria-label="Toggle board statistics"
                  title="Toggle statistics"
                  className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 border ${showStats ? "bg-blue-600/20 text-blue-200 border-blue-500/30 hover:bg-blue-600/30" : "bg-white/[0.05] hover:bg-white/[0.08] text-white/80 border-white/[0.1]"}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Stats</span>
                </button>
              </div>
            </motion.div>
          </SectionCard>
        </section>

        {/* Statistics Panel */}
        <AnimatePresence>
          {showStats && getBoardStats() && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
              <SectionCard className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" /> Board Statistics
                  </h2>
                  <button onClick={() => setShowStats(false)} className="p-1 text-white/50 hover:text-white/80 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Folder className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white/70">Total Boards</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">{getBoardStats()?.total}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-white/70">Collaborators</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">{getBoardStats()?.collaborators}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-blue-300" />
                      <span className="text-sm text-white/70">Active This Week</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">{getBoardStats()?.recent}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-amber-300" />
                      <span className="text-sm text-white/70">Avg. Collaborators</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">{getBoardStats()?.average}</div>
                  </div>
                </div>

                {/* Plan Usage Section */}
                {boardUsageData?.myBoardUsage && (
                  <div className="mt-6 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <Crown className="w-4 h-4 text-blue-400" />
                        Plan Usage
                      </h3>
                      <span className="text-sm font-medium text-white/60 capitalize">
                        {boardUsageData.myBoardUsage.plan} Plan
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Board Limit</span>
                        <span className="font-medium text-white">
                          {boardUsageData.myBoardUsage.currentBoardCount} / {boardUsageData.myBoardUsage.boardLimit}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            boardUsageData.myBoardUsage.usagePercentage >= 80 
                              ? 'bg-orange-500' 
                              : boardUsageData.myBoardUsage.usagePercentage >= 60 
                              ? 'bg-yellow-500' 
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(boardUsageData.myBoardUsage.usagePercentage, 100)}%` }}
                        />
                      </div>
                      {!boardUsageData.myBoardUsage.canCreateMore && (
                        <div className="flex items-center gap-2 text-sm text-orange-400 bg-orange-400/10 px-3 py-2 rounded-lg border border-orange-400/20">
                          <AlertTriangle className="h-4 w-4" />
                          <span>You've reached your board limit. Upgrade to Pro for unlimited boards.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Controls */}
        {data?.myBoards?.length > 0 && (
          <SectionCard className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search boards… (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 bg-white/[0.05] ring-1 ring-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-white/60" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="px-3 py-2 text-white/80 bg-white/[0.05] ring-1 ring-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="updated" className="bg-[#111111]">Last Updated</option>
                    <option value="created" className="bg-[#111111]">Date Created</option>
                    <option value="name" className="bg-[#111111]">Name</option>
                    <option value="collaborators" className="bg-[#111111]">Collaborators</option>
                  </select>
                </div>

                <div className="flex bg-white/[0.05] ring-1 ring-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-white/70 hover:text-white"}`}
                    aria-pressed={viewMode === "grid"}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className={`w-4 h-4 ${viewMode === "grid" ? "text-blue-600" : ""}`} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-white/70 hover:text-white"}`}
                    aria-pressed={viewMode === "list"}
                    aria-label="List view"
                  >
                    <List className={`w-4 h-4 ${viewMode === "list" ? "text-blue-600" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Boards List */}
        {filteredAndSortedBoards.length > 0 ? (
          <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6" : "space-y-4"}>
            {paginatedBoards.map((board: Board) =>
              viewMode === "grid" ? (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                   whileHover={{ y: -2 }}
                   transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="group h-full bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center">
                      <Folder className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getActivityColor(getActivityLevel(board))}`}>
                        {getActivityLevel(board) === "high" && <Zap className="w-3 h-3 inline mr-1" />}
                        {getActivityLevel(board) === "medium" && <Activity className="w-3 h-3 inline mr-1" />}
                        {getActivityLevel(board) === "low" && <Clock className="w-3 h-3 inline mr-1" />}
                        {getActivityLevel(board)}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-white/40 hover:text-white/80 transition-colors" aria-label="More options">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">{board.name}</h3>

                  <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Updated {getTimeAgo(board.updatedAt)}</span>
                  </div>

                  {board.collaborators && board.collaborators.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {board.collaborators.slice(0, 3).map((collaborator) => (
                          <div
                            key={collaborator.id}
                            className="w-6 h-6 rounded-full bg-blue-500/40 border-2 border-white/20 text-white text-xs font-medium flex items-center justify-center"
                            title={collaborator.name}
                          >
                            {collaborator.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {board.collaborators.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-white/20 text-white/70 text-xs font-medium flex items-center justify-center">
                            +{board.collaborators.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white/60">
                        {board.collaborators.length} collaborator{board.collaborators.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <PrimaryButton onClick={() => router.push(`/board/${board.id}`)} className="flex-1 min-h-[40px]">
                      <ExternalLink className="w-4 h-4" />
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </PrimaryButton>
                    <button
                      onClick={() => inviteToBoard(board)}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
                      title="Invite collaborators"
                    >
                      <UserPlus2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/[0.03] rounded-xl border border-white/[0.08] p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center">
                        <Folder className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{board.name}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getActivityColor(getActivityLevel(board))}`}>
                            {getActivityLevel(board)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Updated {getTimeAgo(board.updatedAt)}</span>
                          </div>
                          {board.collaborators && board.collaborators.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>
                                {board.collaborators.length} collaborator{board.collaborators.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PrimaryButton onClick={() => router.push(`/board/${board.id}`)} className="min-h-[40px]">
                        <ExternalLink className="w-4 h-4" /> Open
                      </PrimaryButton>
                      <button
                        onClick={() => inviteToBoard(board)}
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
                        title="Invite collaborators"
                      >
                        <UserPlus2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </div>
          {filteredAndSortedBoards.length > pageSize && (
            <div className="mt-6">
              <SectionCard className="py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-white/60">
                    Showing {Math.min((currentPage - 1) * pageSize + 1, filteredAndSortedBoards.length)} -
                    {Math.min(currentPage * pageSize, filteredAndSortedBoards.length)} of {filteredAndSortedBoards.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white border border-white/10 text-sm"
                      aria-label="Previous page"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      const isEdge = page === 1 || page === 2 || page === totalPages - 1 || page === totalPages;
                      const isNear = Math.abs(page - currentPage) <= 1;
                      if (totalPages > 7 && !(isEdge || isNear)) {
                        if (page === 3 || page === totalPages - 2) {
                          return (
                            <span key={`ellipsis-${page}`} className="px-2 text-white/50">…</span>
                          );
                        }
                        return null;
                      }
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          aria-current={currentPage === page ? "page" : undefined}
                          className={`px-3 py-2 rounded-lg text-sm border ${currentPage === page ? "bg-blue-600/20 text-blue-200 border-blue-500/30" : "bg-white/10 hover:bg-white/15 text-white border-white/10"}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white border border-white/10 text-sm"
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}
          </>
        ) : data?.myBoards?.length === 0 ? (
          <SectionCard className="mt-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center mx-auto mb-4">
              <Folder className="w-10 h-10 text-white/80" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No boards yet</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">Create your first board to start collaborating with your team.</p>
            <PrimaryButton onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" /> Create Your First Board
            </PrimaryButton>
            <div className="mt-4 text-sm text-white/50">
              Tip: Use <kbd className="px-2 py-1 rounded bg-white/10 border border-white/10 text-white/70">Ctrl+N</kbd> to create a new board
            </div>
          </SectionCard>
        ) : (
          <SectionCard className="mt-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-white/70" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No boards found</h3>
            <p className="text-white/60 mb-6">Try adjusting your search terms or create a new board.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
            >
              Clear Search
            </button>
          </SectionCard>
        )}

        {/* Modals */}
        <CreateBoardModal
          isOpen={showCreateModal}
          onCloseAction={() => setShowCreateModal(false)}
          onSuccessAction={handleBoardCreated}
        />
        <SuccessModal
          isOpen={showSuccessModal}
          onCloseAction={() => {
            setShowSuccessModal(false);
            setCreatedBoard(null);
          }}
          title="Board Created"
          message="Your board has been created successfully. You can start working on it now."
          boardId={createdBoard?.id}
          boardName={createdBoard?.name}
        />
        {selectedBoard && (
          <InviteCollaboratorsModal
            isOpen={showInviteModal}
            onCloseAction={() => {
              setShowInviteModal(false);
              setSelectedBoard(null);
            }}
            boardId={selectedBoard.id}
            boardName={selectedBoard.name}
          />
        )}
      </div>
    </div>
  );
};

export default function MyBoardsPageWrapper() {
  return (
    <RequireAuth>
      <MyBoardsPage />
    </RequireAuth>
  );
}
