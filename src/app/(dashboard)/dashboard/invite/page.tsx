'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

const supabase = createClient()

function AcceptInviteInner() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const accept = async () => {
    if (!user || !token) {
      setError('Sign in and open a valid invite link.')
      return
    }
    setPending(true)
    setError('')
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
      const hash = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      const { data: invite, error: inviteError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('token_hash', hash)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()
      if (inviteError || !invite) throw new Error(inviteError?.message || 'Invite not found')

      const { error: memberError } = await supabase.from('family_members').insert({
        family_id: invite.family_id,
        user_id: user.id,
        role: invite.role,
        status: 'active',
      })
      if (memberError) throw new Error(memberError.message)

      await supabase
        .from('family_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invite.id)

      router.replace('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept invite')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="card-elevated space-y-4 text-center">
      <h1 className="font-serif text-3xl font-bold">Join family</h1>
      <p className="text-stone-600">Accept your invitation to start preserving memories together.</p>
      {!user && <p className="text-sm text-amber-700">Please sign in first.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="button" className="btn btn-primary w-full" disabled={pending || !user} onClick={accept}>
        {pending ? 'Joining…' : 'Accept invite'}
      </button>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <div className="mx-auto max-w-md py-16">
      <Suspense fallback={<div className="spinner mx-auto" />}>
        <AcceptInviteInner />
      </Suspense>
    </div>
  )
}
