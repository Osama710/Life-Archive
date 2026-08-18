'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useFamily } from '@/context/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion } from '@/components/PageMotion'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { SelectField } from '@/components/SelectField'

const supabase = createClient()

export default function FamilyPage() {
  const { family, familyId, families, setFamilyId, hasFamily, isLoading } = useFamily()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const invite = async () => {
    if (!familyId || !email.trim()) return
    setError('')
    setMessage('')
    setCopied(false)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const token = crypto.randomUUID()
    const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
    const hash = Array.from(new Uint8Array(tokenHash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    const { error: inviteError } = await supabase.from('family_invitations').insert({
      family_id: familyId,
      email: email.trim().toLowerCase(),
      role,
      token_hash: hash,
      invited_by: user.id,
      expires_at: expires.toISOString(),
    })
    if (inviteError) {
      setError(inviteError.message)
      return
    }
    const link = `${window.location.origin}/dashboard/invite?token=${token}`
    setMessage(link)
    setEmail('')
  }

  const copyLink = async () => {
    if (!message) return
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageMotion className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Family"
        subtitle="Invite your people. Owner, editor, viewer — everyone gets a role."
      />

      {!isLoading && !hasFamily && (
        <section className="glass-card space-y-4 p-6">
          <h2 className="font-display text-xl font-bold text-ink">No family archive yet</h2>
          <p className="text-sm text-ink/55">
            Create a family space to invite people and start saving memories together.
          </p>
          <Link href="/onboarding" className="btn btn-primary inline-flex">
            Create family archive
          </Link>
        </section>
      )}

      {hasFamily && families.length > 1 && (
        <section className="glass-card p-6">
          <SelectField
            label="Active family"
            id="family"
            value={familyId || ''}
            onChange={(e) => setFamilyId(e.target.value)}
          >
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </SelectField>
        </section>
      )}

      {hasFamily && (
      <section className="glass-card p-6">
        <h2 className="font-display text-xl font-bold text-ink">
          {family?.name || 'No family selected'}
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Share your archive with the people who were actually there.
        </p>
      </section>
      )}

      {hasFamily && (
      <section className="glass-card space-y-4 p-6">
        <h3 className="font-display text-lg font-bold">Invite member</h3>
        <Input
          type="email"
          label="Email"
          placeholder="someone@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <SelectField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
        >
          <option value="editor">Editor — can add & edit</option>
          <option value="viewer">Viewer — look only</option>
        </SelectField>
        <Button type="button" onClick={invite}>
          Generate invite link
        </Button>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="alert alert-error text-sm"
              role="alert"
            >
              {error}
            </motion.p>
          )}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white/60 p-4"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/45">
                Share this link privately
              </p>
              <p className="break-all text-sm text-ink/70">{message}</p>
              <Button type="button" variant="secondary" className="mt-3" onClick={copyLink}>
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      )}
    </PageMotion>
  )
}
