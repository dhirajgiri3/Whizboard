import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

// Mock next-auth getServerSession
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Mock pubSub from graphql schema (avoid hoisting issues by not referencing outer variables)
vi.mock('@/lib/graphql/schema', () => ({
  pubSub: { publish: vi.fn() },
}));

// Mock logger
vi.mock('@/lib/logger/logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Mock NextAuth route to avoid DB/env coupling
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

// Import after mocks
import { getServerSession } from 'next-auth/next';
import { POST } from '@/app/api/board/user-presence/route';

function createRequest(json: any) {
  return {
    json: async () => json,
  } as unknown as NextRequest;
}

describe('User Presence API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (getServerSession as any).mockResolvedValue(null);

    const req = createRequest({ boardId: 'b1', userId: 'u1', presence: { status: 'online' } });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('returns 400 when required fields missing', async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });

    const req = createRequest({ boardId: '', userId: '', presence: null });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('returns 403 when userId does not match session', async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });

    const req = createRequest({ boardId: 'b1', userId: 'u2', presence: { status: 'online' } });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it('publishes presence update when authenticated and authorized', async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });

    const presence = { status: 'online', lastSeen: new Date(), sessionDuration: 0 } as any;
    const req = createRequest({ boardId: 'b1', userId: 'u1', presence });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const schema = await import('@/lib/graphql/schema');
    expect((schema as any).pubSub.publish).toHaveBeenCalledWith('userPresenceUpdate', 'b1', {
      userId: 'u1',
      presence,
    });
  });
});
