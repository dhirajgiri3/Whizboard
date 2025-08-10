import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    context: any
) {
    try {
        const { username } = context.params as { username: string };

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const db = await connectToDatabase();

        // Find user by username (we'll use email as username for now, or add a username field)
        const user = await db.collection('users').findOne(
            {
                $or: [
                    { username: username },
                    { email: username }
                ]
            },
            {
                projection: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    image: 1,
                    bio: 1,
                    createdAt: 1,
                    username: 1,
                    isPublicProfile: 1
                }
            }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if profile is public (default to true for now)
        const isPublic = (user as any).isPublicProfile !== false;

        if (!isPublic) {
            return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
        }

        const userId = (user as any)._id;

        // Get user statistics
        const [
            boardsStats,
            collaborationStats,
            elementsStats
        ] = await Promise.all([
            // Public boards statistics
            db.collection('boards').aggregate([
                {
                    $match: {
                        $or: [
                            { createdBy: userId, isPublic: true },
                            { 'collaborators.id': userId.toString(), isPublic: true }
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
                        }
                    }
                }
            ]).toArray(),

            // Collaboration statistics
            db.collection('boards').aggregate([
                {
                    $match: {
                        $or: [
                            { createdBy: userId, isPublic: true },
                            { 'collaborators.id': userId.toString(), isPublic: true }
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
                                    {
                                        $and: [
                                            { $ne: ['$collaborators.id', userId.toString()] },
                                            { $ne: ['$collaborators.id', null] }
                                        ]
                                    },
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

            // Elements statistics
            db.collection('boards').aggregate([
                {
                    $match: {
                        $or: [
                            { createdBy: userId, isPublic: true },
                            { 'collaborators.id': userId.toString(), isPublic: true }
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
                            $sum: { $cond: [{ $eq: ['$elements.createdBy', userId.toString()] }, 1, 0] }
                        }
                    }
                }
            ]).toArray()
        ]);

        // Process results with defaults
        const boards = boardsStats[0] || {
            totalBoards: 0,
            ownedBoards: 0,
            collaboratedBoards: 0
        };

        const collaboration = collaborationStats[0] || {
            totalCollaborators: 0
        };

        const elements = elementsStats[0] || {
            totalElements: 0,
            createdElements: 0
        };

        const collaborationRate = boards.totalBoards > 0
            ? Math.round((collaboration.totalCollaborators / boards.totalBoards) * 10) / 10
            : 0;

        return NextResponse.json({
            success: true,
            profile: {
                name: (user as any).name || 'Anonymous User',
                email: (user as any).email,
                image: (user as any).image || null,
                bio: (user as any).bio || '',
                createdAt: (user as any).createdAt || null,
                username: (user as any).username || (user as any).email
            },
            stats: {
                boards: {
                    total: boards.totalBoards,
                    owned: boards.ownedBoards,
                    collaborated: boards.collaboratedBoards
                },
                collaboration: {
                    totalCollaborators: collaboration.totalCollaborators,
                    collaborationRate: collaborationRate
                },
                elements: {
                    total: elements.totalElements,
                    created: elements.createdElements
                }
            }
        });

    } catch (error: any) {
        console.error('Public profile fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}