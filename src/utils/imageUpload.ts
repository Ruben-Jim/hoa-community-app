import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

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

const getImageSizeAsync = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};

export const optimizeImageForUpload = async (
  uri: string,
  options: OptimizeImageOptions = {}
): Promise<ImageManipulator.ImageResult> => {
  const { maxDimension, compress, format } = { ...DEFAULT_OPTIONS, ...options };

  let resizeWidth: number | undefined;
  let resizeHeight: number | undefined;

  try {
    const { width, height } = await getImageSizeAsync(uri);
    const largestDimension = Math.max(width, height);

    if (largestDimension > maxDimension) {
      const scale = maxDimension / largestDimension;
      resizeWidth = Math.round(width * scale);
      resizeHeight = Math.round(height * scale);
    }
  } catch (error) {
    // If we fail to get the image size, fall back to resizing by width.
    resizeWidth = maxDimension;
  }

  const actions: ImageManipulator.Action[] = [];

  if (resizeWidth || resizeHeight) {
    actions.push({
      resize: {
        width: resizeWidth,
        height: resizeHeight,
      },
    });
  }

  return ImageManipulator.manipulateAsync(uri, actions, {
    compress,
    format,
  });
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


