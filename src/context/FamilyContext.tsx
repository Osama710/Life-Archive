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
  hasFamily: boolean
  setFamilyId: (id: string) => void
  setChildId: (id: string | null) => void
  clearFamilySelection: () => void
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

function clearStoredFamilySelection() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(FAMILY_KEY)
  localStorage.removeItem(CHILD_KEY)
}

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { data: families = [], isLoading: familiesLoading } = useGetFamilies(!!user)
  const [familyId, setFamilyIdState] = useState<string | null>(null)
  const [childId, setChildIdState] = useState<string | null>(null)
  const { data: kids = [], isLoading: childrenLoading } = useGetChildren(familyId || '')

  const clearFamilySelection = () => {
    clearStoredFamilySelection()
    setFamilyIdState(null)
    setChildIdState(null)
  }

  useEffect(() => {
    if (!user) {
      clearFamilySelection()
      return
    }

    if (familiesLoading) return

    if (families.length === 0) {
      clearFamilySelection()
      return
    }

    const stored = readStoredFamilyId()
    const validStored = stored && families.some((f) => f.id === stored)
    const nextFamilyId = validStored ? stored : families[0]!.id

    setFamilyIdState(nextFamilyId)
    localStorage.setItem(FAMILY_KEY, nextFamilyId)
  }, [user, families, familiesLoading])

  useEffect(() => {
    if (!familyId) {
      setChildIdState(null)
      return
    }

    if (childrenLoading) return

    if (kids.length === 0) {
      setChildIdState(null)
      localStorage.removeItem(CHILD_KEY)
      return
    }

    const storedChild = readStoredChildId()
    if (storedChild && kids.some((c) => c.id === storedChild)) {
      setChildIdState(storedChild)
      return
    }

    const nextChildId = kids[0]!.id
    setChildIdState(nextChildId)
    localStorage.setItem(CHILD_KEY, nextChildId)
  }, [familyId, kids, childrenLoading])

  const family = families.find((f) => f.id === familyId) ?? null
  const hasFamily = !!family

  const value = useMemo<FamilyContextValue>(
    () => ({
      families,
      children: kids,
      familyId: hasFamily ? familyId : null,
      childId: hasFamily ? childId : null,
      family,
      child: hasFamily ? (kids.find((c) => c.id === childId) ?? null) : null,
      hasFamily,
      setFamilyId: (id) => {
        setFamilyIdState(id)
        localStorage.setItem(FAMILY_KEY, id)
      },
      setChildId: (id) => {
        setChildIdState(id)
        if (id) localStorage.setItem(CHILD_KEY, id)
        else localStorage.removeItem(CHILD_KEY)
      },
      clearFamilySelection,
      isLoading: familiesLoading || (!!familyId && childrenLoading),
    }),
    [families, kids, familyId, childId, family, hasFamily, familiesLoading, childrenLoading],
  )

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
}

export function useFamily() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider')
  return ctx
}
