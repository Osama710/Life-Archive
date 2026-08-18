interface SendInviteEmailInput {
  to: string
  inviteLink: string
  familyName: string
  inviterName: string
  role: string
}

export async function sendInviteEmail({
  to,
  inviteLink,
  familyName,
  inviterName,
  role,
}: SendInviteEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from =
    process.env.INVITE_FROM_EMAIL?.trim() || 'Life Archive <onboarding@resend.dev>'

  if (!apiKey) {
    throw new Error(
      'Email is not configured yet. Set RESEND_API_KEY and INVITE_FROM_EMAIL in your environment.',
    )
  }

  const roleLabel =
    role === 'viewer' ? 'view memories' : 'add and edit memories together'

  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1a1625; max-width: 520px;">
      <h1 style="font-size: 22px; margin-bottom: 8px;">You're invited to ${familyName}</h1>
      <p>${inviterName} invited you to join their family archive on <strong>Life Archive</strong>.</p>
      <p>You'll be able to ${roleLabel} — photos, milestones, and stories for your kid, synced on both phones.</p>
      <p style="margin: 28px 0;">
        <a href="${inviteLink}" style="background: #7c3aed; color: #fff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 600;">
          Accept invite
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">Sign up with <strong>${to}</strong> — it must match this invite email.</p>
      <p style="font-size: 12px; color: #999; word-break: break-all;">Or paste this link: ${inviteLink}</p>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `${inviterName} invited you to ${familyName} on Life Archive`,
      html,
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message || 'Could not send invite email')
  }
}
