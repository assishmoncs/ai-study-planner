import type { ApiResponse } from '@/types';

/** Require a successful response payload rather than caching missing data as an empty result. */
export function responseData<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === undefined) {
    throw new Error(response.message || 'The server returned an incomplete response.');
  }
  return response.data;
}
