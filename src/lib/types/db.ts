export interface User {
  id: string
  email: string
  createdAt: string
}

export interface Family {
  id: string
  name: string
  createdBy: string
  createdAt: string
}

export interface FamilyMember {
  id: string
  familyId: string
  userId: string
  role: 'owner' | 'editor' | 'viewer' | 'guest'
  joinedAt: string
}

export interface Child {
  id: string
  familyId: string
  name: string
  birthDate: string
  gender?: string
  photoUrl?: string
  createdAt: string
}

export interface Memory {
  id: string
  familyId: string
  childId: string
  title: string
  description?: string
  memoryDate: string
  memoryTime?: string
  location?: string
  mood?: string
  isFavorite: boolean
  isPrivate: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface MemoryMedia {
  id: string
  memoryId: string
  mediaType: 'photo' | 'video' | 'audio' | 'document'
  url: string
  cloudinaryId?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  createdAt: string
}

export interface Collection {
  id: string
  familyId: string
  name: string
  description?: string
  createdBy: string
  createdAt: string
}

export interface MemoryCollection {
  id: string
  collectionId: string
  memoryId: string
  sortOrder: number
}
