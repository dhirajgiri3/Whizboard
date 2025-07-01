 "use client";

import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserPlus2, ExternalLink, Plus, Users } from 'lucide-react';
import InviteCollaboratorsModal from '@/components/ui/modal/InviteCollaboratorsModal';
import { toast } from 'sonner';

const GET_MY_BOARDS = gql`
  query GetMyBoards {
    myBoards {
      id
      name
    }
  }
`;

const CREATE_BOARD = gql`
    mutation CreateBoard($name: String!) {
        createBoard(name: $name) {
            id
            name
        }
    }
`;

const MyBoardsPage = () => {
    const router = useRouter();
    const { data, loading, error, refetch } = useQuery(GET_MY_BOARDS);
    const [createBoard] = useMutation(CREATE_BOARD);
    const [newBoardName, setNewBoardName] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState<{ id: string; name: string } | null>(null);

    const handleCreateBoard = async () => {
        if (newBoardName.trim() !== '') {
            try {
                await createBoard({ variables: { name: newBoardName } });
                setNewBoardName('');
                refetch();
                toast.success('Board created successfully!');
            } catch (err) {
                console.error('Error creating board:', err);
                toast.error('Failed to create board');
            }
        }
    };

    const handleInviteToBoard = (board: { id: string; name: string }) => {
        setSelectedBoard(board);
        setShowInviteModal(true);
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your boards...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-600 mb-4">Error: {error.message}</p>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        My Boards
                    </h1>
                    
                    {/* Create New Board */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Create New Board</h2>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                                placeholder="Enter board name..."
                                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
                            />
                            <button 
                                onClick={handleCreateBoard} 
                                disabled={!newBoardName.trim()}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Create Board
                            </button>
                        </div>
                    </div>

                    {/* Boards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.myBoards.map((board: { id: string; name: string }) => (
                            <div key={board.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 truncate">
                                    {board.name}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push(`/board/${board.id}`)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open
                                    </button>
                                    <button
                                        onClick={() => handleInviteToBoard(board)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                        title="Invite collaborators"
                                    >
                                        <UserPlus2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {data.myBoards.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-600 mb-2">No boards yet</h3>
                            <p className="text-slate-500 mb-6">Create your first board to start collaborating!</p>
                        </div>
                    )}
                </div>

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
