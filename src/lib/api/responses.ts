import { NextResponse } from 'next/server';
import { noStoreHeaders } from './constants';

/**
 * Create a JSON error response
 */
export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json(
    { error: message },
    { status, headers: noStoreHeaders }
  );
}

/**
 * Create a JSON success response
 */
export function jsonSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: noStoreHeaders });
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(): NextResponse {
  return jsonError("Unauthorized", 401);
}

/**
 * Create a not found response
 */
export function notFoundResponse(message = "Not found"): NextResponse {
  return jsonError(message, 404);
}
