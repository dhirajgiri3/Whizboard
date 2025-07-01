"use client";

import { useState, useEffect } from "react";
import { X, Edit3, Loader2, Save } from "lucide-react";
import { gql, useMutation } from "@apollo/client";

const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: String!, $name: String!) {
    updateBoard(id: $id, name: $name) {
      id
      name
    }
  }
`;

interface RenameBoardModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction: (board: { id: string; name: string }) => void;
  board: { id: string; name: string } | null;
}

export default function RenameBoardModal({
  isOpen,
  onCloseAction,
  onSuccessAction,
  board,
}: RenameBoardModalProps) {
  const [boardName, setBoardName] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [initialName, setInitialName] = useState("");

  const [updateBoard, { loading: isUpdating }] = useMutation(UPDATE_BOARD, {
    onCompleted: (data) => {
      onSuccessAction(data.updateBoard);
      onCloseAction();
    },
    onError: (error) => {
      console.error("Error updating board:", error);
    },
  });

  useEffect(() => {
    if (isOpen && board) {
      setIsVisible(true);
      setBoardName(board.name);
      setInitialName(board.name);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setTimeout(() => {
        setBoardName("");
        setInitialName("");
      }, 300);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, board]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!boardName.trim() || !board || boardName.trim() === initialName)
        return;
      updateBoard({
        variables: {
          id: board.id,
          name: boardName.trim(),
        },
      });
    } else if (e.key === "Escape") {
      onCloseAction();
    }
  };

  if (!isOpen || !board) return null;

  const hasChanges =
    boardName.trim() !== initialName && boardName.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[10000] flex min-h-[100vh] items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative mx-4 flex w-full max-w-md flex-col rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:mx-8 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg">
              <Edit3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rename Board</h2>
              <p className="text-sm text-gray-600">
                Give your board a new name
              </p>
            </div>
          </div>
          <button
            onClick={onCloseAction}
            className="rounded-xl p-2 transition-colors duration-200 hover:bg-gray-100"
            disabled={isUpdating}
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 space-y-6 p-6">
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm text-gray-600">Current name</p>
                <p className="truncate font-medium text-gray-900">
                  {initialName}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <label
              htmlFor="boardName"
              className="block text-sm font-medium text-gray-900"
            >
              New Board Name
            </label>
            <div className="relative">
              <input
                id="boardName"
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter new board name..."
                className="w-full rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 text-md font-light px-4 py-3 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                autoFocus
                maxLength={100}
                disabled={isUpdating}
                aria-describedby="char-count"
              />
              {hasChanges && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span id="char-count" className="text-gray-500">
                {boardName.length}/100 characters
              </span>
              {hasChanges && (
                <span className="font-medium text-green-600">
                  Ready to save
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              onClick={onCloseAction}
              className="flex-1 rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (
                  !boardName.trim() ||
                  !board ||
                  boardName.trim() === initialName
                )
                  return;
                updateBoard({
                  variables: { id: board.id, name: boardName.trim() },
                });
              }}
              disabled={!hasChanges || isUpdating}
              className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
