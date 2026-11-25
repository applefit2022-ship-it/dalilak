import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadCatalog } from './data';
import type { Catalog } from './types';

interface Ctx { catalog: Catalog | null; loading: boolean }
const C = createContext<Ctx>({ catalog: null, loading: true });

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  useEffect(() => {
    let alive = true;
    loadCatalog().then((c) => alive && setCatalog(c));
    return () => { alive = false; };
  }, []);
  return <C.Provider value={{ catalog, loading: !catalog }}>{children}</C.Provider>;
}

export const useCatalog = () => useContext(C);
