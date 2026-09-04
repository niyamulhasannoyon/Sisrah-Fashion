import { NextResponse } from 'next/server';

export interface ApiResponseOptions<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode: number;
  details?: any;
}

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Standardized success response helper
 */
export function apiSuccess<T>(data: T, message?: string, status: number = HttpStatus.OK) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      statusCode: status,
    },
    { status }
  );
}

/**
 * Standardized error response helper
 */
export function apiError(
  message: string = 'An unexpected error occurred',
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      statusCode: status,
    },
    { status }
  );
}

/**
 * Global API error handler for catch blocks
 */
export function handleApiError(error: unknown, fallbackMessage: string = 'Internal Server Error') {
  console.error(`[API Error] ${fallbackMessage}:`, error);

  if (error instanceof Error) {
    return apiError(
      error.message || fallbackMessage,
      HttpStatus.INTERNAL_SERVER_ERROR,
      error.stack
    );
  }

  return apiError(fallbackMessage, HttpStatus.INTERNAL_SERVER_ERROR, error);
}
