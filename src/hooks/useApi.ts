import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { mapChild, mapCollection, mapFamily, mapMemory, mapMemoryMedia } from '@/lib/data/mappers'
import { getErrorMessage } from '@/lib/errors'
import type { Child, Memory } from '@/lib/types/db'
import type { TablesUpdate } from '@/lib/types/database'
import type { Tables } from '@/lib/types/database'

const supabase = createClient()

function isMissingRpcError(error: { code?: string; message?: string }) {
  return (
    error.code === 'PGRST202' ||
    !!error.message?.includes('Could not find the function')
  )
}

type FamilyMemberRpcRow = {
  id: string
  user_id: string
  role: FamilyMemberRow['role']
  status: FamilyMemberRow['status']
  joined_at: string | null
  display_name: string | null
}

function mapFamilyMemberRpcRows(rows: FamilyMemberRpcRow[]): FamilyMemberRow[] {
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    displayName: row.display_name?.trim() || 'Family member',
  }))
}

async function ensureFamilyOwnerMembership(familyId: string) {
  const { error } = await supabase.rpc('ensure_family_owner', { p_family_id: familyId })
  if (error && !isMissingRpcError(error) && !error.message?.includes('ensure_family_owner')) {
    throw error
  }
}

async function fetchFamilyMembersDirect(familyId: string): Promise<FamilyMemberRow[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('id, user_id, role, status, joined_at, profiles(display_name)')
    .eq('family_id', familyId)
    .is('removed_at', null)

  if (error) throw error

  return (data ?? [])
    .filter((row) => !row.status || row.status === 'active')
    .map((row) => {
      const profile = row.profiles as { display_name?: string | null } | null
      return {
        id: row.id,
        userId: row.user_id,
        role: row.role,
        status: (row.status ?? 'active') as FamilyMemberRow['status'],
        joinedAt: row.joined_at,
        displayName: profile?.display_name?.trim() || 'Family member',
      }
    })
    .sort((a, b) => {
      const roleOrder = { owner: 0, editor: 1, viewer: 2 } as const
      const diff = (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3)
      if (diff !== 0) return diff
      return (a.joinedAt ?? '').localeCompare(b.joinedAt ?? '')
    })
}

interface CreateMemoryInput {
  familyId: string
  childId?: string
  milestoneId?: string
  title: string
  description?: string
  memoryDate: string
  memoryTime?: string
  location?: string
  mood?: string
  status?: Memory['status']
  isFavorite?: boolean
  isPrivate?: boolean
  createdBy: string
}

interface CreateCollectionInput {
  familyId: string
  name: string
  description?: string
  createdBy: string
}

interface GrowthRecordInput {
  child_id: string
  measurement_date: string
  height_cm?: number
  weight_kg?: number
  head_circumference_cm?: number
  notes?: string
  created_by: string
}

export const useGetFamilies = (enabled = true) =>
  useQuery({
    queryKey: ['families'],
    enabled,
    refetchOnMount: 'always',
    queryFn: async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_families')

      if (!rpcError && rpcData) {
        return rpcData.map(mapFamily)
      }

      if (
        rpcError &&
        rpcError.code !== 'PGRST202' &&
        !rpcError.message.includes('get_my_families') &&
        !rpcError.message.includes('Could not find the function')
      ) {
        throw rpcError
      }

      const { data, error } = await supabase
        .from('families')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapFamily)
    },
  })

export const useCreateFamily = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Family name is required.')

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be signed in to create a family.')

      const { data, error } = await supabase.rpc('create_family', { p_name: trimmed })

      if (!error && data) {
        return mapFamily(data)
      }

      // Legacy DBs before the create_family migration
      if (
        error &&
        (error.code === 'PGRST202' ||
          error.message.includes('create_family') ||
          error.message.includes('Could not find the function'))
      ) {
        const { data: inserted, error: insertError } = await supabase
          .from('families')
          .insert({ name: trimmed, created_by: user.id })
          .select()
          .single()

        if (insertError) {
          throw new Error(getErrorMessage(insertError, 'Could not create family'))
        }

        const { error: memberError } = await supabase.from('family_members').upsert(
          {
            family_id: inserted.id,
            user_id: user.id,
            role: 'owner',
            status: 'active',
            joined_at: new Date().toISOString(),
          },
          { onConflict: 'family_id,user_id' },
        )

        if (memberError) {
          throw new Error(getErrorMessage(memberError, 'Could not create family membership'))
        }

        return mapFamily(inserted)
      }

      throw new Error(getErrorMessage(error, 'Could not create family'))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['families'] }),
  })
}

export interface FamilyMemberRow {
  id: string
  userId: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'pending' | 'active' | 'removed'
  joinedAt: string | null
  displayName: string
}

export interface FamilyInvitationRow {
  id: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  expiresAt: string
  createdAt: string
}

export const useGetFamilyMembers = (familyId: string, enabled = true) =>
  useQuery({
    queryKey: ['family-members', familyId],
    enabled: enabled && !!familyId,
    queryFn: async () => {
      await ensureFamilyOwnerMembership(familyId)

      const { data, error } = await supabase.rpc('get_family_members', {
        p_family_id: familyId,
      })

      if (!error && data?.length) {
        return mapFamilyMemberRpcRows(data as FamilyMemberRpcRow[])
      }

      if (error && !isMissingRpcError(error) && !error.message?.includes('get_family_members')) {
        throw error
      }

      const direct = await fetchFamilyMembersDirect(familyId)
      if (direct.length > 0) return direct

      return mapFamilyMemberRpcRows((data ?? []) as FamilyMemberRpcRow[])
    },
  })

export const useGetFamilyInvitations = (familyId: string, enabled = true) =>
  useQuery({
    queryKey: ['family-invitations', familyId],
    enabled: enabled && !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_family_invitations', {
        p_family_id: familyId,
      })

      if (error) {
        if (isMissingRpcError(error) || error.message?.includes('get_family_invitations')) {
          const now = new Date().toISOString()
          const { data: direct, error: directError } = await supabase
            .from('family_invitations')
            .select('id, email, role, expires_at, created_at')
            .eq('family_id', familyId)
            .is('accepted_at', null)
            .is('revoked_at', null)
            .gt('expires_at', now)
            .order('created_at', { ascending: false })

          if (directError) throw directError

          return (direct ?? []).map(
            (row): FamilyInvitationRow => ({
              id: row.id,
              email: row.email,
              role: row.role,
              expiresAt: row.expires_at,
              createdAt: row.created_at,
            }),
          )
        }
        throw error
      }

      return (data ?? []).map(
        (row): FamilyInvitationRow => ({
          id: row.id,
          email: row.email,
          role: row.role,
          expiresAt: row.expires_at,
          createdAt: row.created_at,
        }),
      )
    },
  })

export const useInviteFamilyMember = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      familyId,
      email,
      role,
    }: {
      familyId: string
      email: string
      role: 'owner' | 'editor' | 'viewer'
    }) => {
      const { data: token, error } = await supabase.rpc('create_family_invitation', {
        p_family_id: familyId,
        p_email: email.trim().toLowerCase(),
        p_role: role,
      })

      if (error) {
        if (
          error.code !== 'PGRST202' &&
          !error.message.includes('create_family_invitation') &&
          !error.message.includes('Could not find the function')
        ) {
          throw new Error(getErrorMessage(error, 'Could not create invitation'))
        }

        const rawToken = crypto.randomUUID()
        const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawToken))
        const hash = Array.from(new Uint8Array(tokenHash))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
        const expires = new Date()
        expires.setDate(expires.getDate() + 7)
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('You must be signed in to invite someone.')

        const { error: insertError } = await supabase.from('family_invitations').insert({
          family_id: familyId,
          email: email.trim().toLowerCase(),
          role,
          token_hash: hash,
          invited_by: user.id,
          expires_at: expires.toISOString(),
        })

        if (insertError) {
          throw new Error(getErrorMessage(insertError, 'Could not create invitation'))
        }

        return rawToken
      }

      if (!token) throw new Error('Could not create invitation')
      return token
    },
    onSuccess: (_token, variables) => {
      queryClient.invalidateQueries({ queryKey: ['family-invitations', variables.familyId] })
    },
  })
}

export const useAcceptFamilyInvitation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.rpc('accept_family_invitation', {
        p_token: token,
      })
      if (error) throw new Error(getErrorMessage(error, 'Could not accept invitation'))
      return data as string
    },
    onSuccess: (familyId) => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
      queryClient.invalidateQueries({ queryKey: ['family-members', familyId] })
      if (typeof window !== 'undefined') {
        localStorage.setItem('life-archive.familyId', familyId)
      }
    },
  })
}

export const useGetChildren = (familyId: string) =>
  useQuery({
    queryKey: ['children', familyId],
    enabled: !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyId)
        .is('deleted_at', null)
        .order('birth_date', { ascending: false })
      if (error) throw error
      return data.map(mapChild)
    },
  })

export const useCreateChild = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => {
      const trimmedName = child.name.trim()
      if (!trimmedName) throw new Error('Child name is required.')

      const { data, error } = await supabase.rpc('create_child', {
        p_family_id: child.familyId,
        p_name: trimmedName,
        p_birth_date: child.birthDate ?? null,
        p_conception_date: child.conceptionDate ?? null,
        p_gender: child.gender ?? null,
        p_photo_url: child.photoUrl ?? null,
        p_journey_type: child.journeyType ?? 'childhood',
      })

      if (!error && data) {
        return mapChild(data)
      }

      if (
        error &&
        (error.code === 'PGRST202' ||
          error.message.includes('create_child') ||
          error.message.includes('Could not find the function'))
      ) {
        const { data: inserted, error: insertError } = await supabase
          .from('children')
          .insert({
            family_id: child.familyId,
            name: trimmedName,
            birth_date: child.birthDate,
            conception_date: child.conceptionDate,
            gender: child.gender,
            photo_url: child.photoUrl,
            journey_type: child.journeyType,
            created_by: child.createdBy,
          })
          .select()
          .single()

        if (insertError) {
          throw new Error(getErrorMessage(insertError, 'Could not create child'))
        }

        return mapChild(inserted)
      }

      throw new Error(getErrorMessage(error, 'Could not create child'))
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['children', data.familyId] })
      queryClient.invalidateQueries({ queryKey: ['families'] })
    },
  })
}

export const useGetMemories = (
  familyId: string,
  limit = 20,
  offset = 0,
  enabled = true,
) =>
  useQuery({
    queryKey: ['memories', familyId, offset],
    enabled: enabled && !!familyId,
    queryFn: async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_family_memories', {
        p_family_id: familyId,
        p_limit: limit,
        p_offset: offset,
      })

      if (!rpcError) {
        const rows = rpcData ?? []
        return {
          memories: rows.map((row) => mapMemory(row)),
          total: rows.length,
        }
      }

      const rpcMissing =
        rpcError.code === 'PGRST202' ||
        rpcError.message.includes('get_family_memories') ||
        rpcError.message.includes('Could not find the function')

      if (!rpcMissing) {
        throw rpcError
      }

      let result = await supabase
        .from('memories')
        .select('*', { count: 'exact' })
        .eq('family_id', familyId)
        .is('deleted_at', null)
        .order('memory_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (result.error?.message.includes('deleted_at') || result.error?.code === '42703') {
        result = await supabase
          .from('memories')
          .select('*', { count: 'exact' })
          .eq('family_id', familyId)
          .order('memory_date', { ascending: false })
          .range(offset, offset + limit - 1)
      }

      if (result.error) throw result.error

      const rows = result.data ?? []
      return {
        memories: rows.map((row) => mapMemory(row)),
        total: result.count || rows.length,
      }
    },
  })

async function fetchMemoryById(memoryId: string) {
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_memory', {
    p_id: memoryId,
  })

  if (!rpcError && rpcData) {
    const memory = mapMemory(rpcData as Tables<'memories'>)
    const { data: mediaRows, error: mediaError } = await supabase.rpc('get_memory_media', {
      p_memory_id: memoryId,
    })

    if (!mediaError && mediaRows?.length) {
      return {
        ...memory,
        media: (mediaRows as Tables<'memory_media'>[]).map(mapMemoryMedia),
      }
    }

    return memory
  }

  const rpcMissing =
    rpcError?.code === 'PGRST202' ||
    rpcError?.message.includes('get_memory') ||
    rpcError?.message.includes('Could not find the function')

  if (rpcError && !rpcMissing) {
    throw rpcError
  }

  let result = await supabase.from('memories').select('*').eq('id', memoryId).single()

  if (result.error?.message.includes('deleted_at') || result.error?.code === '42703') {
    result = await supabase.from('memories').select('*').eq('id', memoryId).single()
  }

  if (result.error) throw result.error

  const memory = mapMemory(result.data)
  const mediaResult = await supabase
    .from('memory_media')
    .select('*')
    .eq('memory_id', memoryId)
    .order('sort_order', { ascending: true })

  if (!mediaResult.error && mediaResult.data?.length) {
    return { ...memory, media: mediaResult.data.map(mapMemoryMedia) }
  }

  return memory
}

export const useGetMemory = (memoryId: string) =>
  useQuery({
    queryKey: ['memory', memoryId],
    enabled: !!memoryId,
    queryFn: () => fetchMemoryById(memoryId),
  })

export const useCreateMemory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memory: CreateMemoryInput) => {
      const { data, error } = await supabase.rpc('create_memory', {
        p_family_id: memory.familyId,
        p_title: memory.title.trim(),
        p_description: memory.description ?? null,
        p_memory_date: memory.memoryDate,
        p_memory_time: memory.memoryTime ?? null,
        p_location: memory.location ?? null,
        p_mood: memory.mood ?? null,
        p_child_id: memory.childId ?? null,
        p_milestone_id: memory.milestoneId ?? null,
        p_status: memory.status ?? 'published',
        p_is_favorite: memory.isFavorite ?? false,
        p_is_private: memory.isPrivate ?? true,
      })

      if (!error && data) {
        return mapMemory(data)
      }

      if (
        error &&
        error.code !== 'PGRST202' &&
        !error.message.includes('create_memory') &&
        !error.message.includes('Could not find the function')
      ) {
        throw new Error(getErrorMessage(error, 'Could not create memory'))
      }

      const { data: inserted, error: insertError } = await supabase
        .from('memories')
        .insert({
          family_id: memory.familyId,
          child_id: memory.childId,
          milestone_id: memory.milestoneId,
          title: memory.title.trim(),
          description: memory.description,
          memory_date: memory.memoryDate,
          memory_time: memory.memoryTime,
          location: memory.location,
          mood: memory.mood,
          status: memory.status ?? 'published',
          is_favorite: memory.isFavorite ?? false,
          is_private: memory.isPrivate ?? true,
          created_by: memory.createdBy,
        })
        .select('*')
        .single()

      if (insertError) {
        throw new Error(getErrorMessage(insertError, 'Could not create memory'))
      }

      return mapMemory(inserted)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['memory', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['memories', data.familyId] })
    },
  })
}

export const useUpdateMemory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Memory> & { id: string }) => {
      const payload: TablesUpdate<'memories'> = {}
      if (updates.title !== undefined) payload.title = updates.title
      if (updates.description !== undefined) payload.description = updates.description
      if (updates.memoryDate !== undefined) payload.memory_date = updates.memoryDate
      if (updates.memoryTime !== undefined) payload.memory_time = updates.memoryTime
      if (updates.location !== undefined) payload.location = updates.location
      if (updates.mood !== undefined) payload.mood = updates.mood
      if (updates.status !== undefined) payload.status = updates.status
      if (updates.isFavorite !== undefined) payload.is_favorite = updates.isFavorite
      if (updates.isPrivate !== undefined) payload.is_private = updates.isPrivate
      if (updates.updatedBy !== undefined) payload.updated_by = updates.updatedBy
      if (updates.version !== undefined) payload.version = updates.version

      const { data, error } = await supabase
        .from('memories')
        .update(payload)
        .eq('id', id)
        .select('*, memory_media(*)')
        .single()
      if (error) throw error
      return mapMemory(data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['memories', data.familyId] })
      queryClient.invalidateQueries({ queryKey: ['memory', data.id] })
    },
  })
}

export const useDeleteMemory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memoryId: string) => {
      const now = new Date()
      const purge = new Date(now)
      purge.setDate(purge.getDate() + 30)
      const { error } = await supabase
        .from('memories')
        .update({
          deleted_at: now.toISOString(),
          purge_after: purge.toISOString(),
          status: 'deleted',
        })
        .eq('id', memoryId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memories'] }),
  })
}

export const useGetDeletedMemories = (familyId: string) =>
  useQuery({
    queryKey: ['memories-deleted', familyId],
    enabled: !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*, memory_media(*)')
        .eq('family_id', familyId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
      if (error) throw error
      return data.map((row) => mapMemory(row))
    },
  })

export const useRestoreMemory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memoryId: string) => {
      const { error } = await supabase
        .from('memories')
        .update({
          deleted_at: null,
          purge_after: null,
          status: 'published',
        })
        .eq('id', memoryId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      queryClient.invalidateQueries({ queryKey: ['memories-deleted'] })
    },
  })
}

export const useGetCollections = (familyId: string) =>
  useQuery({
    queryKey: ['collections', familyId],
    enabled: !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('family_id', familyId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapCollection)
    },
  })

export const useCreateCollection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (collection: CreateCollectionInput) => {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          family_id: collection.familyId,
          name: collection.name,
          description: collection.description,
          created_by: collection.createdBy,
        })
        .select()
        .single()
      if (error) throw error
      return mapCollection(data)
    },
    onSuccess: (data) =>
      queryClient.invalidateQueries({ queryKey: ['collections', data.familyId] }),
  })
}

export const useAddMemoryToCollection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      collectionId,
      memoryId,
    }: {
      collectionId: string
      memoryId: string
    }) => {
      const { error } = await supabase.rpc('add_memory_to_collection', {
        p_collection_id: collectionId,
        p_memory_id: memoryId,
      })

      if (!error) return

      const rpcMissing =
        error.code === 'PGRST202' ||
        error.message.includes('add_memory_to_collection') ||
        error.message.includes('Could not find the function')

      if (rpcMissing) {
        const { error: insertError } = await supabase
          .from('memory_collections')
          .insert({ collection_id: collectionId, memory_id: memoryId })

        if (insertError) throw insertError
        return
      }

      throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection-memories', variables.collectionId] })
      queryClient.invalidateQueries({ queryKey: ['memory-collections', variables.memoryId] })
    },
  })
}

export const useRemoveMemoryFromCollection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      collectionId,
      memoryId,
    }: {
      collectionId: string
      memoryId: string
    }) => {
      const { error } = await supabase.rpc('remove_memory_from_collection', {
        p_collection_id: collectionId,
        p_memory_id: memoryId,
      })

      if (!error) return

      const rpcMissing =
        error.code === 'PGRST202' ||
        error.message.includes('remove_memory_from_collection') ||
        error.message.includes('Could not find the function')

      if (rpcMissing) {
        const { error: deleteError } = await supabase
          .from('memory_collections')
          .delete()
          .eq('collection_id', collectionId)
          .eq('memory_id', memoryId)

        if (deleteError) throw deleteError
        return
      }

      throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection-memories', variables.collectionId] })
      queryClient.invalidateQueries({ queryKey: ['memory-collections', variables.memoryId] })
    },
  })
}

export const useGetCollectionMemories = (collectionId: string) =>
  useQuery({
    queryKey: ['collection-memories', collectionId],
    enabled: !!collectionId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_collection_memories', {
        p_collection_id: collectionId,
      })

      if (!error && data) {
        return data.map(mapMemory)
      }

      if (
        error &&
        error.code !== 'PGRST202' &&
        !error.message.includes('get_collection_memories')
      ) {
        throw error
      }

      const { data: links, error: linkError } = await supabase
        .from('memory_collections')
        .select('memory_id')
        .eq('collection_id', collectionId)

      if (linkError) throw linkError
      if (!links?.length) return []

      const ids = links.map((row) => row.memory_id)
      const memories = await Promise.all(ids.map((id) => fetchMemoryById(id)))
      return memories
    },
  })

export const useGetMemoryCollectionIds = (memoryId: string) =>
  useQuery({
    queryKey: ['memory-collections', memoryId],
    enabled: !!memoryId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_memory_collection_ids', {
        p_memory_id: memoryId,
      })

      if (!error && data) {
        return data as string[]
      }

      if (
        error &&
        error.code !== 'PGRST202' &&
        !error.message.includes('get_memory_collection_ids')
      ) {
        throw error
      }

      const { data: rows, error: rowError } = await supabase
        .from('memory_collections')
        .select('collection_id')
        .eq('memory_id', memoryId)

      if (rowError) throw rowError
      return (rows ?? []).map((row) => row.collection_id)
    },
  })

export const useSearchMemories = (familyId: string, query: string) =>
  useQuery({
    queryKey: ['search', familyId, query],
    enabled: !!familyId && query.trim().length > 0,
    queryFn: async () => {
      const term = query.trim().toLowerCase()

      const { data: rpcData, error: rpcError } = await supabase.rpc('get_family_memories', {
        p_family_id: familyId,
        p_limit: 200,
        p_offset: 0,
      })

      if (!rpcError && rpcData) {
        return rpcData
          .map(mapMemory)
          .filter(
            (memory) =>
              memory.title.toLowerCase().includes(term) ||
              (memory.description?.toLowerCase().includes(term) ?? false),
          )
      }

      const sanitized = query.trim().replace(/[%(),]/g, '')
      let result = await supabase
        .from('memories')
        .select('*')
        .eq('family_id', familyId)
        .or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
        .is('deleted_at', null)
        .order('memory_date', { ascending: false })

      if (result.error?.message.includes('deleted_at') || result.error?.code === '42703') {
        result = await supabase
          .from('memories')
          .select('*')
          .eq('family_id', familyId)
          .or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
          .order('memory_date', { ascending: false })
      }

      if (result.error) throw result.error
      return (result.data ?? []).map(mapMemory)
    },
  })

export const useGetGrowthRecords = (childId: string) =>
  useQuery({
    queryKey: ['growth', childId],
    enabled: !!childId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('growth_records')
        .select('*')
        .eq('child_id', childId)
        .order('measurement_date', { ascending: false })
      if (error) throw error
      return data
    },
  })

export const useAddGrowthRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: GrowthRecordInput) => {
      const { data, error } = await supabase
        .from('growth_records')
        .insert(record)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) =>
      queryClient.invalidateQueries({ queryKey: ['growth', data.child_id] }),
  })
}
