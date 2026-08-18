'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import {
  useGetFamilyInvitations,
  useGetFamilyMembers,
  useInviteFamilyMember,
} from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion } from '@/components/PageMotion'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { SelectField } from '@/components/SelectField'
import { buildInviteLink } from '@/lib/invites'
import { getErrorMessage } from '@/lib/errors'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  editor: 'Editor — can add & edit memories',
  viewer: 'Viewer — look only',
}

export default function FamilyPage() {
  const { user } = useAuth()
  const { family, familyId, families, setFamilyId, hasFamily, isLoading } = useFamily()
  const { data: members = [], isLoading: membersLoading } = useGetFamilyMembers(
    familyId || '',
    hasFamily,
  )
  const myMembership = members.find((member) => member.userId === user?.id)
  const isOwner = myMembership?.role === 'owner'
  const { data: invitations = [] } = useGetFamilyInvitations(familyId || '', hasFamily && isOwner)
  const inviteMember = useInviteFamilyMember()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')
  const [inviteLink, setInviteLink] = useState('')
  const [invitedEmail, setInvitedEmail] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const partnerHint = useMemo(
    () =>
      'Invite your partner — we email them a join link (same email they use to sign up). They install the app, sign up, tap Accept, and you both share the archive.',
    [],
  )

  const sendInvite = async () => {
    if (!familyId || !email.trim()) return
    setError('')
    setSuccessMessage('')
    setInviteLink('')
    setCopied(false)

    const trimmedEmail = email.trim().toLowerCase()

    try {
      const token = await inviteMember.mutateAsync({
        familyId,
        email: trimmedEmail,
        role,
      })
      const link = buildInviteLink(token)

      const sendRes = await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          email: trimmedEmail,
          inviteLink: link,
          familyName: family?.name || 'your family archive',
          role,
        }),
      })

      if (sendRes.ok) {
        setSuccessMessage(`Invite email sent to ${trimmedEmail}`)
        setEmail('')
        return
      }

      const sendBody = (await sendRes.json().catch(() => null)) as { error?: string } | null
      setInviteLink(link)
      setInvitedEmail(trimmedEmail)
      setEmail('')
      setError(
        sendBody?.error
          ? `${sendBody.error} — copy the link below and send it manually.`
          : 'Email could not be sent — copy the link below instead.',
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create invitation'))
    }
  }

  const copyLink = async () => {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = async () => {
    if (!inviteLink || !navigator.share) return
    try {
      await navigator.share({
        title: `Join ${family?.name || 'our family archive'}`,
        text: `Join our Life Archive so we can save memories together. Sign up with ${invitedEmail}, then open this link.`,
        url: inviteLink,
      })
    } catch {
      // user cancelled share sheet
    }
  }

  return (
    <PageMotion className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Family"
        subtitle="Share your archive with the people raising your kid — partner, grandparents, and more."
      />

      {!isLoading && !hasFamily && (
        <section className="glass-card space-y-4 p-6">
          <h2 className="font-display text-xl font-bold text-ink">No family archive yet</h2>
          <p className="text-sm text-ink/55">
            Create a family space first, then invite your partner to add memories from their phone too.
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
          <h2 className="font-display text-xl font-bold text-ink">{family?.name}</h2>
          <p className="mt-2 text-sm text-ink/55">
            Everyone in this archive sees the same timeline, children, and memories on their own phone.
          </p>
        </section>
      )}

      {hasFamily && (
        <section className="glass-card p-6">
          <h3 className="font-display text-lg font-bold text-ink">People in this archive</h3>
          {membersLoading ? (
            <p className="mt-3 text-sm text-ink/50">Loading members…</p>
          ) : members.length === 0 ? (
            <p className="mt-3 text-sm text-ink/50">No members found yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-white/50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {member.displayName}
                      {member.userId === user?.id ? ' (you)' : ''}
                    </p>
                    <p className="text-xs text-ink/45">{ROLE_LABELS[member.role] || member.role}</p>
                  </div>
                  <span className="badge badge-primary shrink-0 capitalize">{member.role}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {hasFamily && isOwner && (
        <section className="glass-card space-y-4 p-6">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Invite your partner</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">{partnerHint}</p>
          </div>

          <Input
            type="email"
            label="Their email"
            placeholder="wife@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hint="Must match the email they use to sign up"
          />
          <SelectField
            label="Access level"
            value={role}
            onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
          >
            <option value="editor">Editor — add & edit memories (recommended for partner)</option>
            <option value="viewer">Viewer — read only</option>
          </SelectField>

          <Button type="button" onClick={sendInvite} disabled={inviteMember.isPending || !email.trim()}>
            {inviteMember.isPending ? 'Sending invite…' : 'Send invite email'}
          </Button>

          <AnimatePresence>
            {successMessage && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="alert alert-success text-sm"
                role="status"
              >
                {successMessage}
              </motion.p>
            )}
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
            {inviteLink && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-primary/15 bg-white/60 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
                  Send this to {invitedEmail}
                </p>
                <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-ink/70">
                  <li>Install Life Archive on their phone</li>
                  <li>Sign up with <strong>{invitedEmail}</strong></li>
                  <li>Open this link and tap Accept</li>
                </ol>
                <p className="mt-4 break-all rounded-xl bg-ink/5 p-3 text-xs text-ink/65">{inviteLink}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={copyLink}>
                    {copied ? 'Copied!' : 'Copy link'}
                  </Button>
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <Button type="button" variant="secondary" onClick={shareLink}>
                      Share link
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {hasFamily && !isOwner && !membersLoading && (
        <section className="glass-card p-6 text-sm text-ink/60">
          Only the family owner can invite new members. Ask them to send you an invite from their Family
          page if someone else still needs access.
        </section>
      )}

      {hasFamily && isOwner && invitations.length > 0 && (
        <section className="glass-card p-6">
          <h3 className="font-display text-lg font-bold text-ink">Pending invites</h3>
          <ul className="mt-4 space-y-2">
            {invitations.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink/8 bg-white/50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-ink">{invite.email}</p>
                  <p className="text-xs text-ink/45">
                    {ROLE_LABELS[invite.role]} · expires{' '}
                    {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="badge">Waiting</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageMotion>
  )
}
