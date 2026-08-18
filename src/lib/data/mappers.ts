import type { Tables } from "@/lib/types/database";
import type { Child, Collection, Family, Memory, MemoryMedia } from "@/lib/types/db";

export function mapFamily(row: Tables<"families">): Family {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapChild(row: Tables<"children">): Child {
  return {
    id: row.id,
    familyId: row.family_id,
    name: row.name,
    birthDate: row.birth_date ?? undefined,
    conceptionDate: row.conception_date ?? undefined,
    gender: row.gender ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    journeyType: row.journey_type,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMemoryMedia(row: Tables<"memory_media">): MemoryMedia {
  return {
    id: row.id,
    memoryId: row.memory_id,
    mediaType: row.media_type,
    provider: row.provider,
    providerAssetId: row.provider_asset_id,
    url: row.url,
    secureUrl: row.secure_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    fileName: row.file_name ?? undefined,
    bytes: row.bytes ?? undefined,
    mimeType: row.mime_type ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function mapMemory(
  row: Tables<"memories"> & { memory_media?: Tables<"memory_media">[] | Tables<"memory_media"> | null },
): Memory {
  const mediaRows = Array.isArray(row.memory_media)
    ? row.memory_media
    : row.memory_media
      ? [row.memory_media]
      : undefined
  return {
    id: row.id,
    familyId: row.family_id,
    childId: row.child_id ?? undefined,
    milestoneId: row.milestone_id ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    memoryDate: row.memory_date,
    memoryTime: row.memory_time ?? undefined,
    location: row.location ?? undefined,
    mood: row.mood ?? undefined,
    status: row.status,
    isFavorite: row.is_favorite,
    isPrivate: row.is_private,
    createdBy: row.created_by,
    updatedBy: row.updated_by ?? undefined,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: mediaRows?.map(mapMemoryMedia),
  };
}

export function mapCollection(row: Tables<"collections">): Collection {
  return {
    id: row.id,
    familyId: row.family_id,
    name: row.name,
    description: row.description ?? undefined,
    coverMediaId: row.cover_media_id ?? undefined,
    collectionType: row.collection_type,
    sortOrder: row.sort_order,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
