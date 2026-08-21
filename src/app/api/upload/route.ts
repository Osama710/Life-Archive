import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { attachMemoryMedia } from "@/lib/r2/attachMedia";
import { getConfiguredR2Client } from "@/lib/r2/client";
import { r2ConfigError } from "@/lib/r2/config";
import { buildObjectKey, publicUrlForKey } from "@/lib/r2/keys";
import { getMemoryForUpload } from "@/lib/r2/memoryAccess";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

function mediaTypeFromMime(mimeType: string): "photo" | "video" {
  return mimeType.startsWith("video/") ? "video" : "photo";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const r2 = getConfiguredR2Client();
  if ("missing" in r2) {
    return NextResponse.json({ error: r2ConfigError(r2.missing) }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const memoryId = String(formData.get("memoryId") ?? "").trim();
  const widthRaw = formData.get("width");
  const heightRaw = formData.get("height");

  if (!(file instanceof File) || !memoryId) {
    return NextResponse.json({ error: "file and memoryId are required" }, { status: 400 });
  }

  const mimeType = file.type || "application/octet-stream";
  const mediaType = mediaTypeFromMime(mimeType);

  const { memory, error: memoryError } = await getMemoryForUpload(supabase, memoryId);
  if (!memory || memoryError) {
    return NextResponse.json({ error: memoryError ?? "Memory not found" }, { status: 404 });
  }

  const key = buildObjectKey(memory.family_id, memory.id, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await r2.client.send(
      new PutObjectCommand({
        Bucket: r2.config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
  } catch {
    return NextResponse.json({ error: "Could not upload file to storage" }, { status: 502 });
  }

  const publicUrl = publicUrlForKey(r2.config.publicDomain, key);
  const width = widthRaw ? Number(widthRaw) : undefined;
  const height = heightRaw ? Number(heightRaw) : undefined;

  const { data, error } = await attachMemoryMedia(supabase, {
    memoryId,
    mediaType,
    providerAssetId: key,
    url: publicUrl,
    secureUrl: publicUrl,
    thumbnailUrl: publicUrl,
    fileName: file.name,
    mimeType,
    bytes: file.size,
    width: Number.isFinite(width) ? width : undefined,
    height: Number.isFinite(height) ? height : undefined,
  });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not save media to your memory" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    key,
    url: publicUrl,
    secureUrl: publicUrl,
    media: data,
  });
}
