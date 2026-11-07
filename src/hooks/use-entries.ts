import { useCallback, useEffect, useRef, useState } from 'react';

import { getEntry, listMyEntries, listPublishedEntries } from '@/services/archive-service';
import type { CulturalEntry, EntryCategory } from '@/lib/types';

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'The archive could not be loaded.';
}

export function useEntries(category?: EntryCategory, province?: string) {
  const [entries, setEntries] = useState<CulturalEntry[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestId.current;
    setIsLoading(true);
    setError('');
    try {
      const result = await listPublishedEntries(category, province);
      if (request === requestId.current) setEntries(result);
    } catch (loadError) {
      if (request === requestId.current) {
        setError(messageFrom(loadError));
        setEntries([]);
      }
    } finally {
      if (request === requestId.current) setIsLoading(false);
    }
  }, [category, province]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    return () => {
      requestId.current += 1;
    };
  }, [refresh]);

  return { entries, error, isLoading, refresh };
}

export function useMyEntries(userId?: string, refreshKey?: string) {
  const [entries, setEntries] = useState<CulturalEntry[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestId.current;
    if (!userId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await listMyEntries(userId);
      if (request === requestId.current) setEntries(result);
    } catch (loadError) {
      if (request === requestId.current) {
        setError(messageFrom(loadError));
        setEntries([]);
      }
    } finally {
      if (request === requestId.current) setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    return () => {
      requestId.current += 1;
    };
  }, [refresh, refreshKey]);

  return { entries, error, isLoading, refresh };
}

export function useEntry(id?: string, refreshKey?: string) {
  const [entry, setEntry] = useState<CulturalEntry | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!id) {
      return;
    }

    void Promise.resolve().then(async () => {
      if (!active) return;
      setIsLoading(true);
      setError('');
      setEntry(null);
      try {
        const result = await getEntry(id);
        if (active) setEntry(result);
      } catch (loadError) {
        if (active) setError(messageFrom(loadError));
      } finally {
        if (active) setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [id, refreshKey]);

  return { entry, error, isLoading: Boolean(id) && isLoading };
}
