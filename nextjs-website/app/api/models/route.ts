import { NextResponse, NextRequest } from "next/server";

/**
 * @swagger
 * /api/models:
 *   get:
 *     summary: Get available AI models
 *     description: Returns a list of available AI models through Vercel AI Gateway
 *     tags:
 *       - Models
 *     responses:
 *       200:
 *         description: Successful response with available models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Model identifier
 *                       object:
 *                         type: string
 *                         description: Object type (model)
 *                       owned_by:
 *                         type: string
 *                         description: Model provider
 *                       created:
 *                         type: number
 *                         description: Creation timestamp
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL;
    const token = process.env.VERCEL_AI_GATEWAY_TOKEN;

    if (!gatewayUrl || !token) {
      console.warn("[Models API] Missing Vercel AI Gateway configuration");
      
      // Return mock models if gateway is not configured
      const mockModels = {
        data: [
          {
            id: "gpt-4",
            object: "model",
            owned_by: "openai",
            created: 1677610602
          },
          {
            id: "gpt-3.5-turbo",
            object: "model", 
            owned_by: "openai",
            created: 1677610602
          },
          {
            id: "claude-3-sonnet",
            object: "model",
            owned_by: "anthropic",
            created: 1677610602
          }
        ]
      };
      
      return NextResponse.json(mockModels);
    }

    // Make request to Vercel AI Gateway
    const response = await fetch(`${gatewayUrl}/v1/models`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Gateway request failed: ${response.status} ${response.statusText}`);
    }

    const models = await response.json();
    return NextResponse.json(models);

  } catch (error) {
    console.error("[Models API Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}