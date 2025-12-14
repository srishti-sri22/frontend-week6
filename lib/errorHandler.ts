export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: string;

  constructor(message: string, code: string, statusCode?: number, details?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  WEBAUTHN_ERROR: 'WEBAUTHN_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const ErrorMessages = {
  [ErrorCodes.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.AUTHENTICATION_ERROR]: 'Authentication failed. Please try logging in again.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.CONFLICT]: 'This resource already exists.',
  [ErrorCodes.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [ErrorCodes.INTERNAL_ERROR]: 'An internal error occurred. Please try again later.',
  [ErrorCodes.WEBAUTHN_ERROR]: 'Passkey operation failed. Please try again.',
  [ErrorCodes.DATABASE_ERROR]: 'Database operation failed. Please try again.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred. Please try again.',
} as const;

export async function handleApiError(response: Response): Promise<AppError> {
  let errorData: ErrorResponse | null = null;
  
  try {
    const text = await response.text();
    if (text) {
      errorData = JSON.parse(text);
    }
  } catch (e) {
    console.error('Failed to parse error response:', e);
  }

  const errorCode = errorData?.error || ErrorCodes.UNKNOWN_ERROR;
  const errorMessage = errorData?.message || ErrorMessages[errorCode as keyof typeof ErrorMessages] || 'An error occurred';
  const details = errorData?.details;

  return new AppError(errorMessage, errorCode, response.status, details);
}

export function handleNetworkError(error: any): AppError {
  console.error('Network error:', error);
  
  if (error instanceof AppError) {
    return error;
  }

  if (error.name === 'AbortError') {
    return new AppError(
      'Request timeout. Please try again.',
      ErrorCodes.NETWORK_ERROR
    );
  }

  if (!navigator.onLine) {
    return new AppError(
      'No internet connection. Please check your network.',
      ErrorCodes.NETWORK_ERROR
    );
  }

  return new AppError(
    ErrorMessages[ErrorCodes.NETWORK_ERROR],
    ErrorCodes.NETWORK_ERROR
  );
}

export function getUserFriendlyMessage(error: AppError | Error | unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ErrorMessages[ErrorCodes.UNKNOWN_ERROR];
}

export function logError(error: AppError | Error | unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  
  console.error(`${timestamp} ${contextStr} Error:`, error);
  
  if (error instanceof AppError) {
    console.error('Error Code:', error.code);
    console.error('Status Code:', error.statusCode);
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

export async function handleFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw handleNetworkError(error);
  }
}

export function isConflictError(error: unknown): boolean {
  return error instanceof AppError && error.code === ErrorCodes.CONFLICT;
}

export function isAuthError(error: unknown): boolean {
  return error instanceof AppError && error.code === ErrorCodes.AUTHENTICATION_ERROR;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof AppError && error.code === ErrorCodes.NOT_FOUND;
}

export function isValidationError(error: unknown): boolean {
  return error instanceof AppError && error.code === ErrorCodes.VALIDATION_ERROR;
}