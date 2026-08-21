import {
  compressImage,
  mediaTypeFromFile,
  readImageDimensions,
} from "@/lib/compression";

async function uploadViaPresign(
  memoryId: string,
  file: File,
  mediaType: "photo" | "video",
  dimensions?: { width?: number; height?: number },
) {
  const mimeType = file.type || (mediaType === "video" ? "video/mp4" : "image/jpeg");

  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      memoryId,
      fileName: file.name,
      mimeType,
    }),
  });

  const presign = await presignRes.json();
  if (!presignRes.ok) {
    throw new Error(presign.error || "Could not prepare upload");
  }

  const putRes = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error("Upload to storage failed. Check your connection and try again.");
  }

  const completeRes = await fetch("/api/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      memoryId,
      mediaType,
      providerAssetId: presign.key,
      url: presign.publicUrl,
      secureUrl: presign.publicUrl,
      thumbnailUrl: presign.publicUrl,
      fileName: file.name,
      mimeType,
      bytes: file.size,
      width: dimensions?.width,
      height: dimensions?.height,
    }),
  });

  if (!completeRes.ok) {
    const err = await completeRes.json();
    throw new Error(err.error || "Could not save media");
  }
}

async function uploadPhoto(memoryId: string, file: File) {
  const compressed = await compressImage(file);
  const dimensions = await readImageDimensions(compressed);
  await uploadViaPresign(memoryId, compressed, "photo", dimensions);
}

async function uploadVideo(memoryId: string, file: File) {
  await uploadViaPresign(memoryId, file, "video");
}

export async function uploadMemoryMedia(memoryId: string, selected: File): Promise<void> {
  if (mediaTypeFromFile(selected) === "video") {
    await uploadVideo(memoryId, selected);
    return;
  }

  await uploadPhoto(memoryId, selected);
}

export async function uploadMemoryMediaBatch(
  memoryId: string,
  files: File[],
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  for (let i = 0; i < files.length; i += 1) {
    onProgress?.(i + 1, files.length);
    await uploadMemoryMedia(memoryId, files[i]!);
  }
}
