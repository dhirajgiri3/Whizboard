"use client";

import { useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'sonner';
import { useBoardContext } from '@/lib/context/BoardContext';
import logger from '@/lib/logger/logger';

const COLLABORATOR_INVITED = gql`
  subscription CollaboratorInvited($boardId: String!) {
    collaboratorInvited(boardId: $boardId) {
      boardId
      inviteeEmail
      inviterName
    }
  }
`;

const COLLABORATOR_JOINED = gql`
  subscription CollaboratorJoined($boardId: String!) {
    collaboratorJoined(boardId: $boardId) {
      boardId
      collaborator {
        id
        name
        email
        avatar
        isOnline
      }
      boardName
    }
  }
`;

const INVITATION_STATUS_CHANGED = gql`
  subscription InvitationStatusChanged($boardId: String!) {
    invitationStatusChanged(boardId: $boardId) {
      invitationId
      status
      email
    }
  }
`;

const BOARD_UPDATES = gql`
  subscription BoardUpdates($boardId: String!) {
    boardUpdates(boardId: $boardId) {
      id
      name
      elements {
        id
        type
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`;

const CURSOR_MOVEMENT = gql`
  subscription CursorMovement($boardId: String!) {
    cursorMovement(boardId: $boardId) {
      x
      y
      userId
      userName
    }
  }
`;

interface UseCollaborationEventsProps {
  boardId: string;
  userId?: string;
  isOwner?: boolean;
}

export function useCollaborationEvents({ boardId, userId, isOwner }: UseCollaborationEventsProps) {
  const { 
    addCollaborator, 
    incrementPendingInvitations, 
    decrementPendingInvitations 
  } = useBoardContext();

  // Listen for new invitations sent
  const { error: invitedError } = useSubscription(COLLABORATOR_INVITED, {
    variables: { boardId },
    skip: !boardId,
    onData: ({ data }) => {
      logger.debug({ subscriptionData: data }, 'Collaborator invited event received');
      const invitationData = data.data?.collaboratorInvited;
      
      if (invitationData && isOwner) {
        // Only show to board owner
        incrementPendingInvitations();
        toast.success(
          `Invitation sent to ${invitationData.inviteeEmail}`,
          {
            description: 'They will receive an email with a link to join the board.',
            duration: 4000,
          }
        );
      }
    },
    onError: (error) => {
      logger.error('Error in collaborator invited subscription:', error);
      toast.error('Connection issue with invitations. Please refresh the page.');
    }
  });

  // Listen for new collaborators joining
  const { error: joinedError } = useSubscription(COLLABORATOR_JOINED, {
    variables: { boardId },
    skip: !boardId,
    onData: ({ data }) => {
      logger.debug({ subscriptionData: data }, 'Collaborator joined event received');
      const joinData = data.data?.collaboratorJoined;
      
      if (joinData && joinData.collaborator.id !== userId) {
        // Add collaborator to local state
        addCollaborator({
          id: joinData.collaborator.id,
          name: joinData.collaborator.name,
          email: joinData.collaborator.email,
          avatar: joinData.collaborator.avatar,
          isOnline: joinData.collaborator.isOnline,
          joinedAt: new Date().toISOString(),
        });

        // Show notification
        toast.success(
          `${joinData.collaborator.name} joined the board! 🎉`,
          {
            description: 'You can now collaborate in real-time.',
            duration: 5000,
            action: {
              label: 'Wave 👋',
              onClick: () => {
                // Could trigger a fun animation or send a wave notification
                toast.success(`👋 Waved at ${joinData.collaborator.name}!`);
              },
            },
          }
        );

        // If this is the owner, decrement pending invitations
        if (isOwner) {
          decrementPendingInvitations();
        }
      }
    },
    onError: (error) => {
      logger.error('Error in collaborator joined subscription:', error);
      toast.error('Connection issue with collaborators. Please refresh the page.');
    }
  });

  // Listen for invitation status changes
  const { error: statusError } = useSubscription(INVITATION_STATUS_CHANGED, {
    variables: { boardId },
    skip: !boardId,
    onData: ({ data }) => {
      logger.debug({ subscriptionData: data }, 'Invitation status changed event received');
      const statusData = data.data?.invitationStatusChanged;
      
      if (statusData && isOwner) {
        const { status, email } = statusData;
        
        if (status === 'accepted') {
          toast.success(
            `${email} accepted your invitation! 🎉`,
            {
              description: 'They can now collaborate on the board.',
              duration: 4000,
            }
          );
          decrementPendingInvitations();
        } else if (status === 'declined') {
          toast.info(
            `${email} declined your invitation`,
            {
              description: 'You can send them another invitation if needed.',
              duration: 4000,
            }
          );
          decrementPendingInvitations();
        }
      }
    },
    onError: (error) => {
      logger.error('Error in invitation status changed subscription:', error);
      toast.error('Connection issue with invitation status. Please refresh the page.');
    }
  });

  // Listen for board updates
  const { error: boardUpdatesError } = useSubscription(BOARD_UPDATES, {
    variables: { boardId },
    skip: !boardId,
    onData: ({ data }) => {
      logger.debug({ subscriptionData: data }, 'Board updates event received');
      const updatedBoard = data.data?.boardUpdates;
      
      if (updatedBoard) {
        // Handle board updates (this will be handled by the board component)
        logger.info('Board updated via subscription');
      }
    },
    onError: (error) => {
      logger.error('Error in board updates subscription:', error);
      toast.error('Connection issue with board updates. Please refresh the page.');
    }
  });

  // Listen for cursor movement
  const { error: cursorError } = useSubscription(CURSOR_MOVEMENT, {
    variables: { boardId },
    skip: !boardId,
    onData: ({ data }) => {
      logger.debug({ subscriptionData: data }, 'Cursor movement event received');
      const cursorData = data.data?.cursorMovement;
      
      if (cursorData && cursorData.userId !== userId) {
        // Handle cursor movement (this will be handled by the cursor component)
        logger.debug('Cursor movement received from another user');
      }
    },
    onError: (error) => {
      logger.error('Error in cursor movement subscription:', error);
      // Don't show toast for cursor errors as they're less critical
    }
  });

  // Handle subscription errors
  useEffect(() => {
    const errors = [invitedError, joinedError, statusError, boardUpdatesError, cursorError];
    const hasErrors = errors.some(error => error);

    if (hasErrors) {
      logger.warn('Some collaboration subscriptions have errors', {
        invitedError: !!invitedError,
        joinedError: !!joinedError,
        statusError: !!statusError,
        boardUpdatesError: !!boardUpdatesError,
        cursorError: !!cursorError,
      });
    }
  }, [invitedError, joinedError, statusError, boardUpdatesError, cursorError]);

  // Cleanup function for any additional cleanup needed
  useEffect(() => {
    return () => {
      // Cleanup if needed
      logger.debug('Collaboration events hook cleanup');
    };
  }, [boardId, userId, isOwner, addCollaborator, incrementPendingInvitations, decrementPendingInvitations]);
}

export default useCollaborationEvents;
