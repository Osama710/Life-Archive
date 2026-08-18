import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { mapChild, mapCollection, mapFamily, mapMemory } from '@/lib/data/mappers'
import { getErrorMessage } from '@/lib/errors'
import type { Child, Memory } from '@/lib/types/db'
import type { TablesUpdate } from '@/lib/types/database'

const supabase = createClient()

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

        return mapFamily(inserted)
      }

      throw new Error(getErrorMessage(error, 'Could not create family'))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['families'] }),
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

export const useGetMemory = (memoryId: string) =>
  useQuery({
    queryKey: ['memory', memoryId],
    enabled: !!memoryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*, memory_media(*)')
        .eq('id', memoryId)
        .single()
      if (error) throw error
      return mapMemory(data)
    },
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
    onSuccess: (data) =>
      queryClient.invalidateQueries({ queryKey: ['memories', data.familyId] }),
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
      const { error } = await supabase
        .from('memory_collections')
        .insert({ collection_id: collectionId, memory_id: memoryId })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] }),
  })
}

export const useSearchMemories = (familyId: string, query: string) =>
  useQuery({
    queryKey: ['search', familyId, query],
    enabled: !!familyId && query.trim().length > 0,
    queryFn: async () => {
      const term = query.trim().replace(/[%(),]/g, '')
      const { data, error } = await supabase
        .from('memories')
        .select('*, memory_media(*)')
        .eq('family_id', familyId)
        .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
        .is('deleted_at', null)
        .order('memory_date', { ascending: false })
      if (error) throw error
      return data.map(mapMemory)
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
