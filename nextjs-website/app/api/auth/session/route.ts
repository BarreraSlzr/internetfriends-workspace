import { NextResponse } from 'next/server'
import type { User } from '@/lib/permissions/schema'

// Mock user database (same as profile route for consistency)
const MOCK_USERS: Record<string, User & { name: string; handle: string }> = {
  'admin-user': {
    id: 'admin-user',
    name: 'Admin User',
    handle: 'admin',
    email: 'admin@internetfriends.xyz',
    role: 'admin',
    plan: 'Admin',
    isActive: true,
  },
  'premium-user': {
    id: 'premium-user',
    name: 'Gemini',
    handle: 'gem',
    email: 'gem@internetfriends.xyz',
    role: 'premium',
    plan: 'Pro',
    isActive: true,
  },
  'free-user': {
    id: 'free-user',
    name: 'Free User',
    handle: 'newbie',
    email: 'user@internetfriends.xyz',
    role: 'free',
    plan: 'Free',
    isActive: true,
  },
}

// Simple session simulation - in a real app, use proper authentication
function getCurrentUserId(): string {
  const userIds = Object.keys(MOCK_USERS)
  const now = Math.floor(Date.now() / 10000) // Change user every 10 seconds for demo
  return userIds[now % userIds.length]
}

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Get current user session
 *     description: Returns the current authenticated user's session data
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Session data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, premium, free]
 *                     plan:
 *                       type: string
 *                 isAuthenticated:
 *                   type: boolean
 *       401:
 *         description: Not authenticated
 */
export async function GET() {
  try {
    // Get current user from session (simulated)
    const userId = getCurrentUserId()
    const user = MOCK_USERS[userId]

    if (!user || !user.isActive) {
      return NextResponse.json(
        { 
          user: null, 
          isAuthenticated: false,
          error: 'Not authenticated' 
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        handle: user.handle,
      },
      isAuthenticated: true,
    })
  } catch (_error) {
    return NextResponse.json(
      { 
        user: null, 
        isAuthenticated: false,
        error: 'Session error' 
      },
      { status: 500 }
    )
  }
}