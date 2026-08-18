export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: "owner" | "editor" | "viewer" | "guest";
  joinedAt: string;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  birthDate?: string;
  conceptionDate?: string;
  gender?: string;
  photoUrl?: string;
  journeyType: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Memory {
  id: string;
  familyId: string;
  childId?: string;
  milestoneId?: string;
  title: string;
  description?: string;
  memoryDate: string;
  memoryTime?: string;
  location?: string;
  mood?: string;
  status: "draft" | "published" | "archived" | "deleted";
  isFavorite: boolean;
  isPrivate: boolean;
  createdBy: string;
  updatedBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  media?: MemoryMedia[];
}

export interface MemoryMedia {
  id: string;
  memoryId: string;
  mediaType: "photo" | "video" | "audio" | "document";
  provider: string;
  providerAssetId: string;
  url: string;
  secureUrl: string;
  thumbnailUrl?: string;
  fileName?: string;
  bytes?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  sortOrder: number;
  createdAt: string;
}

export interface Collection {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  coverMediaId?: string;
  collectionType: "manual" | "year" | "month" | "smart";
  sortOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryCollection {
  id: string;
  collectionId: string;
  memoryId: string;
  sortOrder: number;
}
