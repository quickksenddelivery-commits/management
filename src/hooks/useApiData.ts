import { useEffect, useRef, useState } from 'react';

/**
 * Loads data from the API while rendering instantly with a fallback (mock) value.
 * - Renders `fallback` immediately (no blank/skeleton flash, demo stays premium).
 * - Refreshes from `loader()` and replaces the value when it resolves.
 * - On error (e.g. backend offline) it keeps the fallback silently.
 *
 *   const events = useApiData(loadEvents, mockEvents);
 *   const event  = useApiData(() => loadEvent(id), mockGetEvent(id), [id]);
 */
export function useApiData<T>(loader: () => Promise<T>, fallback: T, deps: unknown[] = []): T {
  const [data, setData] = useState<T>(fallback);
  const loaderRef = useRef(loader);
  useEffect(() => { loaderRef.current = loader; });

  useEffect(() => {
    let alive = true;
    loaderRef.current()
      .then((d) => { if (alive && d !== null && d !== undefined) setData(d); })
      .catch(() => { /* keep fallback */ });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}

/**
 * Same as `useApiData`, but also exposes whether the first load is still in
 * flight — for pages that need to show a loading skeleton instead of
 * silently rendering the fallback as if it were a real "no results" state.
 */
export function useApiDataLoading<T>(loader: () => Promise<T>, fallback: T, deps: unknown[] = []): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(loader);
  useEffect(() => { loaderRef.current = loader; });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loaderRef.current()
      .then((d) => { if (alive && d !== null && d !== undefined) setData(d); })
      .catch(() => { /* keep fallback */ })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}
