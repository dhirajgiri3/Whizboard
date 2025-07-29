"use client";

import { useEffect } from 'react';
// import { useSubscription } from '@apollo/client';
// import { gql } from '@apollo/client';
import { toast } from 'sonner';
import { useBoardContext } from '@/lib/context/BoardContext';
import logger from '@/lib/logger/logger';

// Temporarily disable subscriptions until WebSocket setup is fixed
/*
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
*/

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

  // Temporarily disable subscriptions to fix WebSocket errors
  // TODO: Re-enable once WebSocket setup is properly configured
  
  /*
  // Listen for new invitations sent
  useSubscription(COLLABORATOR_INVITED, {
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
    }
  });

  // Listen for new collaborators joining
  useSubscription(COLLABORATOR_JOINED, {
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
    }
  });

  // Listen for invitation status changes
  useSubscription(INVITATION_STATUS_CHANGED, {
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
    }
  });
  */

  // Cleanup function for any additional cleanup needed
  useEffect(() => {
    return () => {
      // Cleanup if needed
      logger.debug('Collaboration events hook cleanup');
    };
  }, [boardId, userId, isOwner, addCollaborator, incrementPendingInvitations, decrementPendingInvitations]);
}

export default useCollaborationEvents;
