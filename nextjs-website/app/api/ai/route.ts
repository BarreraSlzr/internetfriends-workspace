import { NextResponse, NextRequest } from "next/server";

// This is a placeholder for a real AI client, like OpenAI, Replicate, or a custom service.
// In Phase 3, this would be replaced by the Vercel AI SDK or a direct API client.
const getAIResponse = async (prompt: string): Promise<string> => {
  console.log(`[AI Service Mock] Received prompt: "${prompt}"`);

  // Simulate network delay for a real AI service call
  await new Promise((resolve) => setTimeout(resolve, 750));

  const lowerCasePrompt = prompt.toLowerCase();

  if (lowerCasePrompt.includes("design")) {
    return "Design is not just what it looks like and feels like. Design is how it works. We should focus on a clean, performant, and accessible user experience, using our glassmorphism system and compact radii consistently.";
  }

  if (lowerCasePrompt.includes("component")) {
    return "A great component is atomic, reusable, and well-documented. It should follow the single-responsibility principle. Are you thinking of building a new atomic or molecular component?";
  }

  if (lowerCasePrompt.includes("hetzner")) {
    return "Hetzner is a great choice for our core compute layer! It provides powerful, cost-effective servers perfect for running our backend services, databases, and background jobs, while we let Vercel handle the edge.";
  }

  return `I've processed your request: "${prompt}". The result is a complex matrix of possibilities, but the most likely outcome is a beautifully designed and highly performant user interface.`;
};

/**
 * @swagger
 * /api/ai:
 *   post:
 *     summary: Interact with the AI service
 *     description: Sends a prompt to the AI service and receives a generated response. This endpoint will eventually be powered by a dedicated compute layer.
 *     tags:
 *       - AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to send to the AI.
 *                 example: Tell me about our design system.
 *     responses:
 *       200:
 *         description: Successful AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *       400:
 *         description: Bad Request - prompt is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // In a real application, this is where you would call your AI service.
    // This could be a direct call to OpenAI, Replicate, or your own service
    // running on Hetzner, proxied through the Vercel AI Gateway.
    const aiResponse = await getAIResponse(prompt);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("[AI API Error]", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
