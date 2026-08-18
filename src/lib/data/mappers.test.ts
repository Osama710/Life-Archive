import { describe, expect, it } from 'vitest'
import { mapFamily, mapMemory } from './mappers'

describe('mappers', () => {
  it('maps family snake_case to camelCase', () => {
    expect(
      mapFamily({
        id: 'f1',
        name: 'Khan Family',
        slug: null,
        created_by: 'u1',
        created_at: '2026-01-01',
        updated_at: '2026-01-02',
        deleted_at: null,
      }),
    ).toEqual({
      id: 'f1',
      name: 'Khan Family',
      createdBy: 'u1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    })
  })

  it('maps memory with media', () => {
    const memory = mapMemory({
      id: 'm1',
      family_id: 'f1',
      child_id: null,
      milestone_id: null,
      title: 'First Smile',
      description: null,
      memory_date: '2026-03-20',
      memory_time: null,
      location: null,
      mood: '😊',
      status: 'published',
      is_favorite: true,
      is_private: true,
      created_by: 'u1',
      updated_by: null,
      version: 1,
      created_at: '2026-03-20',
      updated_at: '2026-03-20',
      deleted_at: null,
      purge_after: null,
      memory_media: [],
    })
    expect(memory.title).toBe('First Smile')
    expect(memory.familyId).toBe('f1')
    expect(memory.media).toEqual([])
  })
})
