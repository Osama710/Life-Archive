import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Memory, Family, Child, Collection } from '@/lib/types/db'

const supabase = createClient()

// ============ FAMILIES ============

export const useGetFamilies = () => {
  return useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Family[]
    },
  })
}

export const useCreateFamily = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('families')
        .insert([{ name }])
        .select()
      if (error) throw error
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
    },
  })
}

// ============ CHILDREN ============

export const useGetChildren = (familyId: string) => {
  return useQuery({
    queryKey: ['children', familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyId)
        .order('birth_date', { ascending: false })
      if (error) throw error
      return data as Child[]
    },
    enabled: !!familyId,
  })
}

export const useCreateChild = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('children')
        .insert([child])
        .select()
      if (error) throw error
      return data[0]
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['children', data.family_id] })
    },
  })
}

// ============ MEMORIES ============

export const useGetMemories = (familyId: string, limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['memories', familyId, offset],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('memories')
        .select('*, memory_media(*)', { count: 'exact' })
        .eq('family_id', familyId)
        .is('deleted_at', null)
        .order('memory_date', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return { memories: data as Memory[], total: count || 0 }
    },
    enabled: !!familyId,
  })
}

export const useGetMemory = (memoryId: string) => {
  return useQuery({
    queryKey: ['memory', memoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*, memory_media(*)')
        .eq('id', memoryId)
        .single()
      if (error) throw error
      return data as Memory
    },
    enabled: !!memoryId,
  })
}

export const useCreateMemory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('memories')
        .insert([memory])
        .select()
      if (error) throw error
      return data[0]
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['memories', data.family_id] })
    },
  })
}

export const useUpdateMemory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Memory> & { id: string }) => {
      const { data, error } = await supabase
        .from('memories')
        .update(updates)
        .eq('id', id)
        .select()
      if (error) throw error
      return data[0]
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['memories', data.family_id] })
      queryClient.invalidateQueries({ queryKey: ['memory', data.id] })
    },
  })
}

export const useDeleteMemory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memoryId: string) => {
      const { error } = await supabase
        .from('memories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', memoryId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}

// ============ COLLECTIONS ============

export const useGetCollections = (familyId: string) => {
  return useQuery({
    queryKey: ['collections', familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Collection[]
    },
    enabled: !!familyId,
  })
}

export const useCreateCollection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('collections')
        .insert([collection])
        .select()
      if (error) throw error
      return data[0]
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['collections', data.family_id] })
    },
  })
}

export const useAddMemoryToCollection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ collectionId, memoryId }: { collectionId: string; memoryId: string }) => {
      const { error } = await supabase
        .from('memory_collections')
        .insert([{ collection_id: collectionId, memory_id: memoryId }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
}

// ============ SEARCH ============

export const useSearchMemories = (familyId: string, query: string) => {
  return useQuery({
    queryKey: ['search', familyId, query],
    queryFn: async () => {
      if (!query.trim()) return []
      
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('family_id', familyId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .is('deleted_at', null)
        .order('memory_date', { ascending: false })
      
      if (error) throw error
      return data as Memory[]
    },
    enabled: !!familyId && query.length > 0,
  })
}

// ============ GROWTH ============

export const useGetGrowthRecords = (childId: string) => {
  return useQuery({
    queryKey: ['growth', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('growth_records')
        .select('*')
        .eq('child_id', childId)
        .order('measurement_date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!childId,
  })
}

export const useAddGrowthRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: any) => {
      const { data, error } = await supabase
        .from('growth_records')
        .insert([record])
        .select()
      if (error) throw error
      return data[0]
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['growth', data.child_id] })
    },
  })
}
