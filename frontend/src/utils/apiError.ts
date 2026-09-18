/**
 * Central, safe error-message extraction for API failures.
 *
 * Order of preference:
 *   1. The backend's own `message` field for business errors (400/409 — and
 *      404, which the backend also sends with a message body).
 *   2. Per-status defaults (401/403/5xx never leak server internals).
 *   3. The caller's fallback, then the raw axios message.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.'
): string {
  const err = error as
    | { response?: { status?: number; data?: { message?: unknown } | string }; message?: string }
    | undefined;

  const status = err?.response?.status;
  const data = err?.response?.data;
  const serverMessage =
    data && typeof data === 'object' && typeof data.message === 'string' && data.message.trim().length > 0
      ? data.message
      : undefined;

  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return "You don't have permission to perform this action.";
  if (status === 404) return serverMessage || 'The requested resource was not found.';
  if (status === 409) return serverMessage || 'This change conflicts with the current state. Please refresh and try again.';
  if (status === 400) return serverMessage || 'The request was invalid. Please check the input and try again.';
  if (status !== undefined && status >= 500) return 'An unexpected server error occurred. Please try again.';

  // No HTTP response at all (network failure, DNS, request cancelled) —
  // never surface axios internals like "Network Error".
  if (!err?.response) return fallback;
  return serverMessage || err?.message || fallback;
}

/** True when the API answered 404 — used to render "not found" states. */
export function isNotFoundError(error: unknown): boolean {
  return (error as { response?: { status?: number } } | undefined)?.response?.status === 404;
}