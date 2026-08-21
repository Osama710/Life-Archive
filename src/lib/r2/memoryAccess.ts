import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMemoryForUpload(supabase: SupabaseClient, memoryId: string) {
  const { data: rpcMemory, error: rpcError } = await supabase.rpc("get_memory_for_upload", {
    p_memory_id: memoryId,
  });

  if (rpcMemory?.[0]) {
    return { memory: rpcMemory[0], error: null };
  }

  const { data: directMemory, error: directError } = await supabase
    .from("memories")
    .select("id, family_id")
    .eq("id", memoryId)
    .single();

  if (directError || !directMemory) {
    return {
      memory: null,
      error:
        rpcError?.message ||
        directError?.message ||
        "Memory not found. Save the memory first, then retry the upload.",
    };
  }

  return { memory: directMemory, error: null };
}
