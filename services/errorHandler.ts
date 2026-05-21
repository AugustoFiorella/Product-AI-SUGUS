/**
 * Centralized error handling for API calls
 * Provides consistent error types and user-friendly messages
 */

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class GeminiError extends APIError {
  constructor(
    statusCode: number,
    message: string,
    code?: string
  ) {
    super(statusCode, message, code);
    this.name = 'GeminiError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, code?: string) {
    super(400, message, code);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends APIError {
  constructor(message: string = 'Network request failed') {
    super(0, message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * User-friendly error message mapping
 */
const errorMessageMap: Record<string, string> = {
  GEMINI_RATE_LIMIT: 'Too many requests. Please try again in a moment.',
  GEMINI_INVALID_KEY: 'API configuration error. Please contact support.',
  GEMINI_INVALID_PROMPT: 'Invalid request format. Please check your input.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof APIError) {
    return errorMessageMap[error.code || 'UNKNOWN_ERROR'] || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return errorMessageMap['UNKNOWN_ERROR'];
}

/**
 * Handle API error from fetch response
 */
export async function handleFetchError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({})) as { error?: { message?: string } };

  switch (response.status) {
    case 429:
      throw new GeminiError(429, 'Rate limit exceeded', 'GEMINI_RATE_LIMIT');
    case 401:
    case 403:
      throw new GeminiError(response.status, 'Authentication failed', 'GEMINI_INVALID_KEY');
    case 400: {
      const message = typeof body.error?.message === 'string' ? body.error.message : 'Invalid request';
      throw new GeminiError(400, message, 'GEMINI_INVALID_PROMPT');
    }
    default: {
      const message = typeof body.error?.message === 'string' ? body.error.message : `API error: ${response.statusText}`;
      throw new GeminiError(response.status, message, 'GEMINI_ERROR');
    }
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      if (error instanceof TypeError) {
        throw new NetworkError('Failed to reach the server');
      }
      throw new APIError(500, 'Unknown error occurred', 'UNKNOWN_ERROR');
    }
  };
}
