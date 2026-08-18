'use client'

import { Suspense, useEffect, useRef, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useAcceptFamilyInvitation } from '@/hooks/useApi'
import { PageMotion } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { Button } from '@/components/Button'
import {
  buildAuthNextPath,
  buildInvitePath,
  clearInviteToken,
  readInviteToken,
  storeInviteToken,
} from '@/lib/invites'
import { getErrorMessage } from '@/lib/errors'

function AcceptInviteInner() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const acceptInvite = useAcceptFamilyInvitation()
  const [error, setError] = useState('')
  const autoAcceptStarted = useRef(false)

  const token = useMemo(() => {
    const fromUrl = params.get('token') || ''
    if (fromUrl) {
      storeInviteToken(fromUrl)
      return fromUrl
    }
    return readInviteToken()
  }, [params])

  const invitePath = token ? buildInvitePath(token) : '/dashboard/invite'
  const loginHref = `/login?next=${buildAuthNextPath(invitePath)}`
  const signupHref = `/signup?next=${buildAuthNextPath(invitePath)}`

  useEffect(() => {
    if (authLoading || !user || !token || autoAcceptStarted.current) return
    autoAcceptStarted.current = true

    void acceptInvite
      .mutateAsync(token)
      .then(() => {
        clearInviteToken()
        router.replace('/dashboard/timeline')
      })
      .catch((err) => {
        setError(getErrorMessage(err, 'Could not accept invitation'))
      })
  }, [authLoading, user, token, router])

  const accept = async () => {
    if (!user || !token) {
      setError('Sign in first, then open this invite link again.')
      return
    }
    setError('')
    try {
      await acceptInvite.mutateAsync(token)
      clearInviteToken()
      router.replace('/dashboard/timeline')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not accept invitation'))
    }
  }

  if (!token) {
    return (
      <PageMotion className="mx-auto max-w-md py-10">
        <div className="glass-card p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Invalid invite link</h1>
          <p className="mt-2 text-sm text-ink/60">Ask your partner to send a fresh invite from Family.</p>
          <Link href="/dashboard" className="btn btn-primary mt-6 inline-flex">
            Go to app
          </Link>
        </div>
      </PageMotion>
    )
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
          <h1 className="font-display text-3xl font-bold text-ink">Join your family archive</h1>
          <p className="mt-2 text-ink/60">
            Accept the invite to see and add memories together — from your phone and theirs.
          </p>
        </div>

        {!user && !authLoading && (
          <div className="space-y-3 text-left">
            <p className="alert alert-warning text-sm">
              Sign in or create an account with the <strong>same email</strong> your partner invited.
            </p>
            <Link href={loginHref} className="btn btn-primary w-full">
              Sign in to join
            </Link>
            <Link href={signupHref} className="btn btn-secondary w-full">
              Create account
            </Link>
          </div>
        )}

        {authLoading && <Loader label="Checking account" size="sm" />}

        {user && (
          <>
            <p className="text-sm text-ink/55">
              Signed in as <strong>{user.email}</strong>
            </p>
            {acceptInvite.isPending ? (
              <Loader label="Joining family" message="Adding you to the archive…" size="sm" />
            ) : (
              <Button type="button" className="w-full" disabled={acceptInvite.isPending} onClick={accept}>
                Accept invite
              </Button>
            )}
          </>
        )}

        {error && (
          <p className="alert alert-error text-sm" role="alert">
            {error}
          </p>
        )}
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
