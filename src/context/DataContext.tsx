import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DATA_CHANGED_EVENT } from '../lib/constants';

interface DataContextValue {
  /** Increments whenever localStorage data is saved — use in hook deps to re-read db. */
  version: number;
  refresh: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const handler = () => setVersion((v) => v + 1);
    window.addEventListener(DATA_CHANGED_EVENT, handler);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handler);
  }, []);

  const value = useMemo(() => ({ version, refresh }), [version, refresh]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

/** Re-read localStorage-backed data when any mutation occurs. */
export function useDbRefresh(): number {
  return useData().version;
}
