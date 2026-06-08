/**
 * imageUtils.ts — Clinical-Grade Image Optimizer for Mobile
 * ===========================================================
 * Mirrors the web frontend's resizeImage.ts but uses expo-image-manipulator
 * instead of HTML Canvas (which doesn't exist in React Native).
 *
 * Resizes images to 2048px max dimension before upload to reduce:
 *  - Upload time (especially on cellular)
 *  - Server processing load
 *  - Memory pressure on device
 */

import * as ImageManipulator from 'expo-image-manipulator';

const MAX_DIMENSION = 2048; // 2K Clinical Standard (matches web frontend)
const JPEG_QUALITY = 0.95;  // Near-lossless for clinical clarity

/**
 * Resize an image if it exceeds MAX_DIMENSION on either axis.
 * Returns the (possibly resized) URI.
 *
 * @param imageUri — Local file URI from camera or gallery
 * @returns Object with { uri, width, height } of the optimized image
 */
export async function resizeForUpload(imageUri: string): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  try {
    // First, get the original image dimensions by doing a no-op manipulation
    const original = await ImageManipulator.manipulateAsync(
      imageUri,
      [], // no actions — just read metadata
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    const { width: w, height: h } = original;

    // Already within clinical standards — return as-is
    if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) {
      return { uri: original.uri, width: w, height: h };
    }

    // Calculate scaled dimensions (preserve aspect ratio)
    const scale = MAX_DIMENSION / Math.max(w, h);
    const newW = Math.round(w * scale);
    const newH = Math.round(h * scale);

    // Resize the image
    const resized = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: newW, height: newH } }],
      { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
    );

    console.log(
      `[Clinical-Resize] ${w}×${h} → ${newW}×${newH} | Quality: ${JPEG_QUALITY}`
    );

    return { uri: resized.uri, width: newW, height: newH };
  } catch (error) {
    // If resize fails, return original URI and let the upload proceed
    console.warn('[Clinical-Resize] Failed to resize, using original:', error);
    return { uri: imageUri, width: 0, height: 0 };
  }
}

/**
 * Get MIME type based on file extension.
 */
export function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'dcm':
    case 'dicom':
      return 'application/dicom';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}
