"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
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
  Calendar,
  Activity,
  Bookmark,
  Star,
  BarChart3,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Filter,
  RefreshCw,
} from "lucide-react";
import InviteCollaboratorsModal from "@/components/ui/modal/InviteCollaboratorsModal";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading/Loading";
import CreateBoardModal from "@/components/ui/modal/CreateBoardModal";

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
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error("Error fetching my boards:", error);
      console.error("Error details:", error.message);
      if (error.graphQLErrors) {
        console.error("GraphQL errors:", error.graphQLErrors);
      }
    },
  });
  const [createBoard, { loading: creating }] = useMutation(CREATE_BOARD);

  // State management
  const [newBoardName, setNewBoardName] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Filtered and sorted boards
  const filteredAndSortedBoards = useMemo(() => {
    console.log("My boards data:", data);
    console.log("My boards array:", data?.myBoards);
    if (!data?.myBoards) return [];

    let boards = [...data.myBoards];

    // Filter by search query
    if (searchQuery) {
      boards = boards.filter((board) =>
        board.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort boards
    boards.sort((a, b) => {
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
  }, [data?.myBoards, searchQuery, sortBy]);

  // Board statistics
  const boardStats = useMemo(() => {
    if (!data?.myBoards) return null;

    const boards = data.myBoards;
    const totalBoards = boards.length;
    const totalCollaborators = boards.reduce(
      (acc: number, board: Board) => acc + (board.collaborators?.length || 0),
      0
    );
    const recentBoards = boards.filter((board: Board) => {
      const updatedAt = new Date(board.updatedAt || 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
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
  }, [data?.myBoards]);

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

  const handleBoardCreated = useCallback(
    (board: { id: string; name: string }) => {
      toast.success(`Board "${board.name}" created successfully!`);
      refetch();
    },
    [refetch]
  );

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
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Loading state
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingOverlay text="Loading boards..." />
      </div>
    );

  // Error state
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 mb-6 text-sm">{error.message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">My Boards</h1>
                <p className="text-slate-600 mt-1">
                  {data?.myBoards?.length || 0} board
                  {(data?.myBoards?.length || 0) !== 1 ? "s" : ""} total
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 border border-slate-200 cursor-pointer"
                title="View Statistics"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 border border-slate-200 cursor-pointer"
                title="Refresh (Ctrl+R)"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Statistics Panel */}
          {showStats && boardStats && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Board Statistics
                </h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Total Boards
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    {boardStats.total}
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Collaborators
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    {boardStats.collaborators}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      Active This Week
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-800">
                    {boardStats.recent}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">
                      Avg. Collaborators
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-orange-800">
                    {boardStats.average}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Bar */}
          {data?.myBoards?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search boards... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm text-slate-600 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Sort and View Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <SortAsc className="w-4 h-4 text-slate-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="px-3 py-2 text-slate-500 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="updated">Last Updated</option>
                      <option value="created">Date Created</option>
                      <option value="name">Name</option>
                      <option value="collaborators">Collaborators</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "grid"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boards Display */}
          {filteredAndSortedBoards.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredAndSortedBoards.map((board: Board) =>
                viewMode === "grid" ? (
                  // Grid View
                  <div
                    key={board.id}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Folder className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getActivityColor(
                            getActivityLevel(board)
                          )}`}
                        >
                          {getActivityLevel(board) === "high" && (
                            <Zap className="w-3 h-3 inline mr-1" />
                          )}
                          {getActivityLevel(board) === "medium" && (
                            <Activity className="w-3 h-3 inline mr-1" />
                          )}
                          {getActivityLevel(board) === "low" && (
                            <Clock className="w-3 h-3 inline mr-1" />
                          )}
                          {getActivityLevel(board)}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors">
                      {board.name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(board.updatedAt)}</span>
                    </div>

                    {board.collaborators && board.collaborators.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex -space-x-2">
                          {board.collaborators
                            .slice(0, 3)
                            .map((collaborator, index) => (
                              <div
                                key={collaborator.id}
                                className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                title={collaborator.name}
                              >
                                {collaborator.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          {board.collaborators.length > 3 && (
                            <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 text-xs font-medium border-2 border-white">
                              +{board.collaborators.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {board.collaborators.length} collaborator
                          {board.collaborators.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => router.push(`/board/${board.id}`)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm group cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button
                        onClick={() => inviteToBoard(board)}
                        className="px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center cursor-pointer"
                        title="Invite collaborators"
                      >
                        <UserPlus2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div
                    key={board.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                          <Folder className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-slate-800">
                              {board.name}
                            </h3>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getActivityColor(
                                getActivityLevel(board)
                              )}`}
                            >
                              {getActivityLevel(board)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Updated {getTimeAgo(board.updatedAt)}</span>
                            </div>
                            {board.collaborators &&
                              board.collaborators.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>
                                    {board.collaborators.length} collaborator
                                    {board.collaborators.length !== 1
                                      ? "s"
                                      : ""}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/board/${board.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium text-sm cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open
                        </button>
                        <button
                          onClick={() => inviteToBoard(board)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center cursor-pointer"
                          title="Invite collaborators"
                        >
                          <UserPlus2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : data?.myBoards?.length === 0 ? (
            // Empty state
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Folder className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                No boards yet
              </h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Create your first board to start collaborating with your team
                and bring your ideas to life.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Your First Board
              </button>
              <div className="mt-6 text-sm text-slate-400">
                <p>
                  Tip: Use{" "}
                  <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600">
                    Ctrl+N
                  </kbd>{" "}
                  to create a new board
                </p>
              </div>
            </div>
          ) : (
            // No search results
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-3">
                No boards found
              </h3>
              <p className="text-slate-500 mb-6">
                Try adjusting your search terms or create a new board.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Create Board Modal */}
        <CreateBoardModal
          isOpen={showCreateModal}
          onCloseAction={() => setShowCreateModal(false)}
          onSuccessAction={handleBoardCreated}
        />

        {/* Invite Collaborators Modal */}
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

export default MyBoardsPage;
