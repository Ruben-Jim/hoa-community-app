import React, { ReactNode, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import { useStorageUrl } from '../hooks/useStorageUrl';

type CachePolicy = NonNullable<ExpoImageProps['cachePolicy']>;

export interface OptimizedImageProps extends Omit<ExpoImageProps, 'source'> {
  source?: string | null;
  storageId?: string | null;
  fallback?: ReactNode;
  placeholderContent?: ReactNode;
  transitionDuration?: number;
  cachePolicy?: CachePolicy;
  containerStyle?: ViewStyle;
}

const DEFAULT_PLACEHOLDER_COLOR = 'rgba(229, 231, 235, 1)'; // Tailwind gray-200

const OptimizedImage = React.forwardRef<ExpoImage, OptimizedImageProps>(
  (
    {
      source,
      storageId,
      fallback,
      placeholderContent,
      transitionDuration = 200,
      cachePolicy = 'memory-disk',
      containerStyle,
      style,
      contentFit = 'cover',
      priority,
      recyclingKey,
      allowDownscaling,
      onLoadStart,
      onLoadEnd,
      ...rest
    },
    ref
  ) => {
    const resolvedStorageId = useMemo(() => {
      if (storageId) return storageId;
      if (source && !source.startsWith('http')) {
        return source;
      }
      return null;
    }, [storageId, source]);

    const directUri = source && source.startsWith('http') ? source : undefined;
    const storageUri = useStorageUrl(resolvedStorageId);
    const resolvedUri = directUri ?? storageUri;

    const resolvedPlaceholder = useMemo(() => {
      if (placeholderContent) return placeholderContent;
      return (
        <View style={[styles.placeholder, StyleSheet.flatten(style) as ViewStyle]}>
          <ActivityIndicator size="small" color="#9ca3af" />
        </View>
      );
    }, [placeholderContent, style]);

    if (!resolvedUri) {
      if (storageUri === undefined) {
        return <View style={[styles.placeholderContainer, containerStyle]}>{resolvedPlaceholder}</View>;
      }

      if (fallback) {
        return <>{fallback}</>;
      }

      return <View style={[styles.placeholderContainer, containerStyle]}>{resolvedPlaceholder}</View>;
    }

    const resolvedPriority =
      priority ?? (Platform.OS === 'ios' || Platform.OS === 'android' ? 'high' : 'normal');

    const resolvedRecyclingKey = recyclingKey ?? resolvedStorageId ?? directUri ?? undefined;
    const resolvedAllowDownscaling = allowDownscaling ?? true;

    return (
      <View style={[styles.container, containerStyle]}>
        <ExpoImage
          ref={ref}
          source={{ uri: resolvedUri }}
          contentFit={contentFit}
          transition={transitionDuration}
          cachePolicy={cachePolicy}
          priority={resolvedPriority}
          recyclingKey={resolvedRecyclingKey}
          allowDownscaling={resolvedAllowDownscaling}
          placeholder={{ uri: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><rect width='10' height='10' fill='${encodeURIComponent(DEFAULT_PLACEHOLDER_COLOR)}'/></svg>` }}
          style={style}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          {...rest}
        />
      </View>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: DEFAULT_PLACEHOLDER_COLOR,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DEFAULT_PLACEHOLDER_COLOR,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OptimizedImage;


