import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect, useState, useMemo } from 'react';

// Global cache to store URLs across all component instances
// This prevents multiple queries for the same storageId across different renders
// Convex's useQuery already deduplicates within the same render cycle
const urlCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 55 * 60 * 1000; // 55 minutes (slightly less than Convex's 1 hour URL expiration)

/**
 * Custom hook to get storage URL with intelligent caching
 * This reduces API calls by:
 * 1. Leveraging Convex's built-in query deduplication (same args = one query)
 * 2. Caching URLs in memory across component remounts and different components
 * 3. Reusing cached URLs until they're close to expiration
 * 
 * This is especially important for components like ProfileImage that are rendered
 * many times (posts, comments, etc.) with the same storageId
 */
export const useStorageUrl = (storageId: string | null | undefined): string | undefined => {
  const [cachedUrl, setCachedUrl] = useState<string | undefined>(undefined);
  
  // Skip query if no storageId
  const shouldSkip = !storageId;

  // Use Convex query - it automatically deduplicates queries with the same args
  // So if 100 ProfileImages use the same storageId, only 1 API call is made
  const urlFromQuery = useQuery(
    api.storage.getUrl,
    shouldSkip ? "skip" : { storageId: storageId as any }
  );

  // Check cache synchronously on first render to avoid unnecessary queries
  const initialCached = useMemo(() => {
    if (!storageId) return undefined;
    const cached = urlCache.get(storageId);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.url;
    }
    return undefined;
  }, [storageId]);

  useEffect(() => {
    if (!storageId) {
      setCachedUrl(undefined);
      return;
    }

    const now = Date.now();
    const cached = urlCache.get(storageId);
    
    // If we have a valid cached URL, use it immediately
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setCachedUrl(cached.url);
    }
    
    // When query returns, update cache and state
    if (urlFromQuery) {
      // Only update if URL changed or cache is missing/expired
      if (!cached || cached.url !== urlFromQuery || (now - cached.timestamp) >= CACHE_DURATION) {
        urlCache.set(storageId, { url: urlFromQuery, timestamp: now });
        setCachedUrl(urlFromQuery);
      }
    } else if (urlFromQuery === undefined && cached) {
      // Query is still loading, use cached value if available
      if ((now - cached.timestamp) < CACHE_DURATION) {
        setCachedUrl(cached.url);
      }
    }
  }, [storageId, urlFromQuery]);

  // Return cached URL immediately if available, otherwise return query result
  return initialCached || cachedUrl || urlFromQuery;
};

/**
 * Batch version to get multiple URLs at once
 * This is more efficient for getting many URLs in a single component
 * Still benefits from caching and deduplication
 */
export const useStorageUrls = (storageIds: (string | null | undefined)[]): (string | undefined)[] => {
  const uniqueIds = Array.from(new Set(storageIds.filter(Boolean) as string[]));
  const urls = uniqueIds.map(id => useStorageUrl(id));
  
  // Map back to original array order
  return storageIds.map(id => {
    if (!id) return undefined;
    const index = uniqueIds.indexOf(id);
    return index >= 0 ? urls[index] : undefined;
  });
};

/**
 * Clear the URL cache (useful for testing or manual cache invalidation)
 */
export const clearStorageUrlCache = () => {
  urlCache.clear();
};

