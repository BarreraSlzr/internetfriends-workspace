import { NextResponse } from "next/server";

// Mock user data - in a real app, this would come from a database
const MOCK_USER_DATA = {
  name: "Gemini",
  handle: "gem",
  avatarUrl: "/avatars/gem-avatar.png", // A placeholder path
  email: "gem@internetfriends.xyz",
  plan: "Pro",
  storageUsage: {
    used: 8.5, // GB
    total: 20, // GB
  },
};

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
  // In a real app, you'd have authentication logic here
  // to identify the user and fetch their data from a database.
  return NextResponse.json(MOCK_USER_DATA);
}
