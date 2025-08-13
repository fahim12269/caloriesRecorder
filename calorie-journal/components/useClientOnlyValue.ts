// File: components/useClientOnlyValue.ts
// Purpose: Provide a client-only value in environments where server rendering is not applicable (native).

// This function is web-only as native doesn't currently support server (or build-time) rendering.
/**
 * Returns the client value in environments where rendering only occurs on the client.
 * On native (non-web), this simply returns the client value immediately.
 */
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return client;
}
