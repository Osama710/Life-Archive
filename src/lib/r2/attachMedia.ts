import type { SupabaseClient } from "@supabase/supabase-js";

export type MemoryMediaType = "photo" | "video" | "audio" | "document";

export interface AttachMediaInput {
  memoryId: string;
  mediaType: MemoryMediaType;
  providerAssetId: string;
  url: string;
  secureUrl: string;
  thumbnailUrl?: string;
  fileName?: string;
  mimeType?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export async function attachMemoryMedia(
  supabase: SupabaseClient,
  input: AttachMediaInput,
) {
  const { data: rpcData, error: rpcError } = await supabase.rpc("attach_memory_media", {
    p_memory_id: input.memoryId,
    p_media_type: input.mediaType,
    p_provider: "r2",
    p_provider_asset_id: input.providerAssetId,
    p_url: input.url,
    p_secure_url: input.secureUrl,
    p_thumbnail_url: input.thumbnailUrl ?? input.secureUrl,
    p_file_name: input.fileName ?? null,
    p_mime_type: input.mimeType ?? null,
    p_bytes: input.bytes ?? null,
    p_width: input.width ?? null,
    p_height: input.height ?? null,
  });

  if (!rpcError && rpcData) {
    return { data: rpcData, error: null };
  }

  const { data, error } = await supabase
    .from("memory_media")
    .insert({
      memory_id: input.memoryId,
      media_type: input.mediaType,
      provider: "r2",
      provider_asset_id: input.providerAssetId,
      url: input.url,
      secure_url: input.secureUrl,
      thumbnail_url: input.thumbnailUrl ?? input.secureUrl,
      file_name: input.fileName,
      mime_type: input.mimeType,
      bytes: input.bytes,
      width: input.width,
      height: input.height,
    })
    .select()
    .single();

  return { data, error: rpcError ?? error };
}
