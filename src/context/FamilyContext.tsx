'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useGetChildren, useGetFamilies } from '@/hooks/useApi'
import type { Child, Family } from '@/lib/types/db'

interface FamilyContextValue {
  families: Family[]
  children: Child[]
  familyId: string | null
  childId: string | null
  family: Family | null
  child: Child | null
  setFamilyId: (id: string) => void
  setChildId: (id: string | null) => void
  isLoading: boolean
}

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined)
const FAMILY_KEY = 'life-archive.familyId'
const CHILD_KEY = 'life-archive.childId'

function readStoredFamilyId() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(FAMILY_KEY)
}

function readStoredChildId() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CHILD_KEY)
}

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { data: families = [], isLoading: familiesLoading } = useGetFamilies(!!user)
  const [familyId, setFamilyIdState] = useState<string | null>(null)
  const [childId, setChildIdState] = useState<string | null>(null)
  const { data: kids = [], isLoading: childrenLoading } = useGetChildren(familyId || '')

  useEffect(() => {
    if (!user) {
      setFamilyIdState(null)
      setChildIdState(null)
      return
    }

    const storedFamily = readStoredFamilyId()
    if (storedFamily) setFamilyIdState(storedFamily)

    const storedChild = readStoredChildId()
    if (storedChild) setChildIdState(storedChild)
  }, [user])

  useEffect(() => {
    if (!user || familiesLoading) return

    if (families.length === 0) return

    const stored = readStoredFamilyId()
    if (stored && families.some((f) => f.id === stored)) {
      setFamilyIdState(stored)
      return
    }

    setFamilyIdState(families[0]!.id)
  }, [user, families, familiesLoading])

  useEffect(() => {
    if (!familyId) return

    localStorage.setItem(FAMILY_KEY, familyId)

    if (childrenLoading) return

    const storedChild = readStoredChildId()
    if (storedChild && kids.some((c) => c.id === storedChild)) {
      setChildIdState(storedChild)
      return
    }

    setChildIdState(kids[0]?.id ?? null)
  }, [familyId, kids, childrenLoading])

  const value = useMemo<FamilyContextValue>(
    () => ({
      families,
      children: kids,
      familyId,
      childId,
      family: families.find((f) => f.id === familyId) ?? null,
      child: kids.find((c) => c.id === childId) ?? null,
      setFamilyId: (id) => {
        setFamilyIdState(id)
        localStorage.setItem(FAMILY_KEY, id)
      },
      setChildId: (id) => {
        setChildIdState(id)
        if (id) localStorage.setItem(CHILD_KEY, id)
        else localStorage.removeItem(CHILD_KEY)
      },
      isLoading: familiesLoading || (!!familyId && childrenLoading),
    }),
    [families, kids, familyId, childId, familiesLoading, childrenLoading],
  )

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
}

export function useFamily() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider')
  return ctx
}
