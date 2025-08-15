import { NextResponse } from "next/server";
import type { User } from "@/lib/permissions/schema";

// Mock user database - in a real app, this would come from a database
const MOCK_USERS: Record<string, User & { name: string; handle: string; avatarUrl: string; storageUsage: { used: number; total: number } }> = {
  'admin-user': {
    id: 'admin-user',
    name: "Admin User",
    handle: "admin",
    email: "admin@internetfriends.xyz",
    role: "admin",
    plan: "Admin",
    isActive: true,
    avatarUrl: "/avatars/admin-avatar.png",
    storageUsage: { used: 15.2, total: 100 },
  },
  'premium-user': {
    id: 'premium-user',
    name: "Gemini",
    handle: "gem",
    email: "gem@internetfriends.xyz",
    role: "premium",
    plan: "Pro",
    isActive: true,
    avatarUrl: "/avatars/gem-avatar.png",
    storageUsage: { used: 8.5, total: 20 },
  },
  'free-user': {
    id: 'free-user',
    name: "Free User",
    handle: "newbie",
    email: "user@internetfriends.xyz",
    role: "free",
    plan: "Free",
    isActive: true,
    avatarUrl: "/avatars/free-avatar.png",
    storageUsage: { used: 2.1, total: 5 },
  },
};

// Simple session simulation - in a real app, use proper authentication
function getCurrentUserId(): string {
  // For demo purposes, cycle through different users
  // In production, this would come from session/JWT/auth provider
  const userIds = Object.keys(MOCK_USERS);
  const now = Math.floor(Date.now() / 10000); // Change user every 10 seconds for demo
  return userIds[now % userIds.length];
}

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile data
 *     description: Retrieves the profile information for the currently authenticated user.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 handle:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *                 email:
 *                   type: string
 *                 plan:
 *                   type: string
 *                 storageUsage:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                     total:
 *                       type: number
 */
export async function GET() {
  // Get current user from session (simulated)
  const userId = getCurrentUserId();
  const userData = MOCK_USERS[userId];
  
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(userData);
}
