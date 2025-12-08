import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export interface OptimizeImageOptions {
  maxDimension?: number;
  compress?: number;
  format?: ImageManipulator.SaveFormat;
}

const DEFAULT_OPTIONS: Required<OptimizeImageOptions> = {
  maxDimension: 1600,
  compress: 0.7,
  format: ImageManipulator.SaveFormat.JPEG,
};

export const optimizeImageForUpload = async (
  uri: string,
  options: OptimizeImageOptions = {}
): Promise<ImageManipulator.ImageResult> => {
  const { maxDimension, compress, format } = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Always resize to maxDimension to ensure consistent image sizes
    // ImageManipulator will maintain aspect ratio when only width is specified
    const actions: ImageManipulator.Action[] = [
      {
        resize: {
          width: maxDimension,
        },
      },
    ];

    return await ImageManipulator.manipulateAsync(uri, actions, {
      compress,
      format,
    });
  } catch (error) {
    console.error('Error optimizing image:', error);
    // If manipulation fails, try without resizing
    return await ImageManipulator.manipulateAsync(uri, [], {
      compress,
      format,
    });
  }
};

export interface UploadReadyImage {
  blob: Blob;
  mimeType: string;
  optimizedUri: string;
}

export const getUploadReadyImage = async (
  uri: string,
  options?: OptimizeImageOptions
): Promise<UploadReadyImage> => {
  // For web, handle image upload differently (direct blob conversion)
  if (Platform.OS === 'web') {
    try {
      // On web, the URI might be a blob URL or data URL
      // Try to fetch it directly
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Determine mime type
      const mimeType = blob.type || (options?.format === ImageManipulator.SaveFormat.PNG ? 'image/png' : 'image/jpeg');
      
      return {
        blob,
        mimeType,
        optimizedUri: uri,
      };
    } catch (error) {
      console.error('Error handling web image upload:', error);
      // Fallback: try to create blob from data URL if fetch fails
      if (uri.startsWith('data:')) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const mimeType = blob.type || 'image/jpeg';
        return {
          blob,
          mimeType,
          optimizedUri: uri,
        };
      }
      throw error;
    }
  }
  
  // For iOS and other platforms, use ImageManipulator for optimization
  const optimized = await optimizeImageForUpload(uri, options);
  const response = await fetch(optimized.uri);
  const blob = await response.blob();

  const mimeType = blob.type || (options?.format === ImageManipulator.SaveFormat.PNG ? 'image/png' : 'image/jpeg');

  return {
    blob,
    mimeType,
    optimizedUri: optimized.uri,
  };
};


