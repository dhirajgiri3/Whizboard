import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const userEmail = session.user.email;
    const userId = new ObjectId(session.user.id);

    console.log('Fetching stats for user:', { userEmail, userId: userId.toString() });

    // Parallel queries for better performance
    const [
      boardsStats,
      collaborationStats,
      elementsStats,
      invitationStats,
      activityStats
    ] = await Promise.all([
      // Boards statistics - using correct field names
      db.collection('boards').aggregate([
        {
          $match: {
            $or: [
              { createdBy: userId }, // User owns the board
              { 'collaborators.id': session.user.id } // User is a collaborator
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalBoards: { $sum: 1 },
            ownedBoards: {
              $sum: { $cond: [{ $eq: ['$createdBy', userId] }, 1, 0] }
            },
            collaboratedBoards: {
              $sum: { $cond: [{ $ne: ['$createdBy', userId] }, 1, 0] }
            },
            recentBoards: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      '$updatedAt',
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray(),

      // Collaboration statistics - get unique collaborators from boards user owns or collaborates on
      db.collection('boards').aggregate([
        {
          $match: {
            $or: [
              { createdBy: userId }, // Boards user owns
              { 'collaborators.id': session.user.id } // Boards user collaborates on
            ]
          }
        },
        {
          $unwind: { path: '$collaborators', preserveNullAndEmptyArrays: true }
        },
        {
          $group: {
            _id: null,
            uniqueCollaborators: {
              $addToSet: {
                $cond: [
                  { $and: [
                    { $ne: ['$collaborators.id', session.user.id] }, // Not the current user
                    { $ne: ['$collaborators.id', null] } // Not null
                  ]},
                  '$collaborators.id',
                  null
                ]
              }
            }
          }
        },
        {
          $project: {
            totalCollaborators: {
              $size: {
                $filter: {
                  input: '$uniqueCollaborators',
                  cond: { $ne: ['$$this', null] }
                }
              }
            }
          }
        }
      ]).toArray(),

      // Board elements statistics - elements are embedded in boards
      db.collection('boards').aggregate([
        {
          $match: {
            $or: [
              { createdBy: userId }, // Boards user owns
              { 'collaborators.id': session.user.id } // Boards user collaborates on
            ]
          }
        },
        {
          $unwind: { path: '$elements', preserveNullAndEmptyArrays: true }
        },
        {
          $match: {
            'elements.createdBy': { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            totalElements: { $sum: 1 },
            createdElements: {
              $sum: { $cond: [{ $eq: ['$elements.createdBy', session.user.id] }, 1, 0] }
            },
            recentElements: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$elements.createdBy', session.user.id] },
                      {
                        $gte: [
                          '$elements.createdAt',
                          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                        ]
                      }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray(),

      // Invitation statistics - using correct collection name and field names
      db.collection('board_invitations').aggregate([
        {
          $match: {
            $or: [
              { inviterUserId: userId }, // User sent invitations
              { inviteeEmail: userEmail }  // User received invitations
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalInvitations: { $sum: 1 },
            sentInvitations: {
              $sum: { $cond: [{ $eq: ['$inviterUserId', userId] }, 1, 0] }
            },
            receivedInvitations: {
              $sum: { $cond: [{ $eq: ['$inviteeEmail', userEmail] }, 1, 0] }
            },
            acceptedInvitations: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
            }
          }
        }
      ]).toArray(),

      // Activity statistics (last 30 days) - boards updated recently
      db.collection('boards').aggregate([
        {
          $match: {
            $or: [
              { createdBy: userId },
              { 'collaborators.id': session.user.id }
            ],
            updatedAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$updatedAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $limit: 30
        }
      ]).toArray()
    ]);

    // Process results with defaults
    const boards = boardsStats[0] || {
      totalBoards: 0,
      ownedBoards: 0,
      collaboratedBoards: 0,
      recentBoards: 0
    };

    const collaboration = collaborationStats[0] || {
      totalCollaborators: 0
    };

    const elements = elementsStats[0] || {
      totalElements: 0,
      createdElements: 0,
      recentElements: 0
    };

    const invitations = invitationStats[0] || {
      totalInvitations: 0,
      sentInvitations: 0,
      receivedInvitations: 0,
      acceptedInvitations: 0
    };

    // Calculate additional metrics
    const totalActivity = boards.totalBoards + elements.totalElements + invitations.totalInvitations;
    const recentActivity = boards.recentBoards + elements.recentElements;
    const collaborationRate = boards.totalBoards > 0 
      ? Math.round((collaboration.totalCollaborators / boards.totalBoards) * 10) / 10 
      : 0;

    console.log('Stats calculated:', {
      boards,
      collaboration,
      elements,
      invitations,
      totalActivity,
      recentActivity,
      collaborationRate
    });

    return NextResponse.json({
      success: true,
      stats: {
        boards: {
          total: boards.totalBoards,
          owned: boards.ownedBoards,
          collaborated: boards.collaboratedBoards,
          recent: boards.recentBoards
        },
        collaboration: {
          totalCollaborators: collaboration.totalCollaborators,
          collaborationRate: collaborationRate
        },
        elements: {
          total: elements.totalElements,
          created: elements.createdElements,
          recent: elements.recentElements
        },
        invitations: {
          total: invitations.totalInvitations,
          sent: invitations.sentInvitations,
          received: invitations.receivedInvitations,
          accepted: invitations.acceptedInvitations,
          acceptanceRate: invitations.sentInvitations > 0 
            ? Math.round((invitations.acceptedInvitations / invitations.sentInvitations) * 100) 
            : 0
        },
        activity: {
          total: totalActivity,
          recent: recentActivity,
          dailyActivity: activityStats
        }
      }
    });

  } catch (error: any) {
    console.error('User stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}