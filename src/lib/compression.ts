import imageCompression from "browser-image-compression";

const MAX_IMAGE_DIMENSION = 1920;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    return await imageCompression(file, {
      maxWidthOrHeight: MAX_IMAGE_DIMENSION,
      useWebWorker: true,
      initialQuality: 0.85,
    });
  } catch {
    return file;
  }
}

export function mediaTypeFromFile(file: File): "photo" | "video" {
  return file.type.startsWith("video/") ? "video" : "photo";
}

export async function readImageDimensions(
  file: File,
): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") {
    return {};
  }

  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    return {};
  }
}
