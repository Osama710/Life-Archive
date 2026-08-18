'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { PageMotion } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { Button } from '@/components/Button'

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
      const { error: rpcError } = await supabase.rpc('accept_family_invitation', {
        p_token: token,
      })
      if (rpcError) throw new Error(rpcError.message)
      router.replace('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept invite')
    } finally {
      setPending(false)
    }
  }

  return (
    <PageMotion className="mx-auto flex max-w-md flex-col items-center justify-center py-10">
      <div className="glass-card w-full space-y-5 p-8 text-center">
        <motion.span
          className="inline-block text-5xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          aria-hidden
        >
          👨‍👩‍👧
        </motion.span>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Join the family</h1>
          <p className="mt-2 text-ink/60">
            Accept your invitation to start preserving memories together.
          </p>
        </div>
        {!user && (
          <p className="alert alert-warning text-sm">
            Please{' '}
            <Link href="/login" className="font-semibold underline">
              sign in
            </Link>{' '}
            first, then open this link again.
          </p>
        )}
        {error && (
          <p className="alert alert-error text-sm" role="alert">
            {error}
          </p>
        )}
        <Button type="button" className="w-full" disabled={pending || !user} onClick={accept}>
          {pending ? 'Joining…' : 'Accept invite'}
        </Button>
      </div>
    </PageMotion>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<Loader label="Loading invite" />}>
      <AcceptInviteInner />
    </Suspense>
  )
}
