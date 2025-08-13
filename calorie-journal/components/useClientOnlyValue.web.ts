// File: components/useClientOnlyValue.web.ts
// Purpose: Provide a value that updates after client hydration when server-rendered on web.
import React from 'react';

// `useEffect` is not invoked during server rendering, meaning
// we can use this to determine if we're on the server or not.
/**
 * Returns the server value during SSR and switches to the client value after hydration.
 */
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const [value, setValue] = React.useState<S | C>(server);
  React.useEffect(() => {
    setValue(client);
  }, [client]);

  return value;
}
