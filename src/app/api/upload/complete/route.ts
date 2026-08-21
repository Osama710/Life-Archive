import { NextResponse } from "next/server";
import { attachMemoryMedia } from "@/lib/r2/attachMedia";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    memoryId: string;
    mediaType: "photo" | "video" | "audio" | "document";
    providerAssetId: string;
    url: string;
    secureUrl: string;
    thumbnailUrl?: string;
    fileName?: string;
    mimeType?: string;
    bytes?: number;
    width?: number;
    height?: number;
  };

  if (!body.memoryId || !body.providerAssetId || !body.secureUrl) {
    return NextResponse.json({ error: "Invalid media payload" }, { status: 400 });
  }

  const { data, error } = await attachMemoryMedia(supabase, {
    memoryId: body.memoryId,
    mediaType: body.mediaType,
    providerAssetId: body.providerAssetId,
    url: body.url,
    secureUrl: body.secureUrl,
    thumbnailUrl: body.thumbnailUrl ?? body.secureUrl,
    fileName: body.fileName,
    mimeType: body.mimeType,
    bytes: body.bytes,
    width: body.width,
    height: body.height,
  });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not save media" },
      { status: 400 },
    );
  }

  return NextResponse.json(data);
}
