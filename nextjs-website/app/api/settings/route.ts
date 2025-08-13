import { NextResponse, NextRequest } from "next/server";

// Mock user settings - in a real app, this would be stored in a database
// and associated with the authenticated user.
let userSettings = {
  theme: "system", // 'light', 'dark', or 'system'
  language: "en", // 'en', 'es', etc.
  notifications: {
    email: true,
    push: false,
  },
};

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     description: Retrieves the current user's application settings, such as theme and language.
 *     tags:
 *       - Settings
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 theme:
 *                   type: string
 *                   enum: [light, dark, system]
 *                 language:
 *                   type: string
 *                 notifications:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: boolean
 *                     push:
 *                       type: boolean
 */
export async function GET() {
  // In a real app, you'd fetch these settings from your database
  // based on the logged-in user's ID.
  return NextResponse.json(userSettings);
}

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Update user settings
 *     description: Updates one or more settings for the current user.
 *     tags:
 *       - Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, system]
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       400:
 *         description: Invalid request body
 */
export async function POST(request: NextRequest) {
  try {
    const newSettings = await request.json();

    // In a real app, you would validate the incoming data
    // and then update the user's settings in the database.
    // For this mock, we'll just merge the new settings.
    userSettings = { ...userSettings, ...newSettings };

    console.log("Updated user settings:", userSettings);

    return NextResponse.json(userSettings);
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }
}
