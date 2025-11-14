import { useState, useEffect } from 'react';
import { resolveQuery } from '../services/mockApi';

// Mock query hook that mimics Convex's useQuery
export function useMockQuery<T>(
  queryFn: string | ((args?: any) => T),
  args?: any
): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    // Simulate async loading
    const timer = setTimeout(() => {
      let queryPath: string;

      if (typeof queryFn === 'string') {
        queryPath = queryFn;
      } else {
        // Extract the query path from the function
        // When called as api.residents.getAll, it's a string path
        queryPath = queryFn as any;
      }

      const result = resolveQuery(queryPath, args) as T | undefined;
      setData(result);
    }, 100); // Small delay to simulate network

    return () => clearTimeout(timer);
  }, [queryFn, JSON.stringify(args)]);

  return data;
}

