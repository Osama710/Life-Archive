import { NextResponse } from "next/server";
import { getConfiguredR2Client } from "@/lib/r2/client";
import { r2ConfigError } from "@/lib/r2/config";
import { buildObjectKey, publicUrlForKey } from "@/lib/r2/keys";
import { getMemoryForUpload } from "@/lib/r2/memoryAccess";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const PRESIGN_TTL_SECONDS = 60 * 60;

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

  const body = (await request.json()) as {
    memoryId?: string;
    fileName?: string;
    mimeType?: string;
  };

  const memoryId = body.memoryId?.trim();
  const fileName = body.fileName?.trim();
  const mimeType = body.mimeType?.trim() || "application/octet-stream";

  if (!memoryId || !fileName) {
    return NextResponse.json({ error: "memoryId and fileName are required" }, { status: 400 });
  }

  const isPhoto = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  if (!isPhoto && !isVideo) {
    return NextResponse.json({ error: "Only image and video files are supported" }, { status: 400 });
  }

  const { memory, error: memoryError } = await getMemoryForUpload(supabase, memoryId);
  if (!memory || memoryError) {
    return NextResponse.json({ error: memoryError ?? "Memory not found" }, { status: 404 });
  }

  const key = buildObjectKey(memory.family_id, memory.id, fileName);
  const publicUrl = publicUrlForKey(r2.config.publicDomain, key);

  const command = new PutObjectCommand({
    Bucket: r2.config.bucketName,
    Key: key,
    ContentType: mimeType,
  });

  let uploadUrl: string;
  try {
    uploadUrl = await getSignedUrl(r2.client, command, { expiresIn: PRESIGN_TTL_SECONDS });
  } catch {
    return NextResponse.json({ error: "Could not prepare upload" }, { status: 502 });
  }

  return NextResponse.json({
    uploadUrl,
    key,
    publicUrl,
    memoryId,
  });
}
