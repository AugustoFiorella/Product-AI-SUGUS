/**
 * Vercel Serverless Function: Secure Gemini API Proxy
 *
 * This function proxies Gemini API calls from the frontend.
 * The API key is stored server-side in environment variables and never exposed to the browser.
 *
 * Deploy: this file is automatically deployed to Vercel Serverless Functions when committed to /api
 */

interface GeminiRequestBody {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GeminiResponse {
  content: string;
  model: string;
  usageTokens?: {
    prompt: number;
    completion: number;
  };
}

const API_KEY = process.env['GEMINI_API_KEY'];
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export default async function handler(
  req: { method: string; body: GeminiRequestBody },
  res: {
    setHeader: (key: string, value: string) => void;
    status: (code: number) => { json: (data: unknown) => void; end: () => void };
  }
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const allowedOrigin = process.env['ALLOWED_ORIGIN'] || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Validate API key
  if (!API_KEY) {
    console.error('GEMINI_API_KEY not configured');
    res.status(500).json({ error: 'API not configured' });
    return;
  }

  try {
    const body = req.body as GeminiRequestBody;
    const { prompt, model = 'gemini-2.5-flash', temperature = 0.7, maxTokens = 2048 } = body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Call Gemini API server-side
    const response = await fetch(
      `${GEMINI_API_URL}/${model}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      res.status(response.status).json({
        error: `Gemini API error: ${error.error?.message || 'Unknown error'}`,
      });
      return;
    }

    const data = await response.json();
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from API';

    res.status(200).json({
      content,
      model,
      usageTokens: {
        prompt: data.usageMetadata?.promptTokenCount || 0,
        completion: data.usageMetadata?.candidatesTokenCount || 0,
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
