import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInviteEmail } from '@/lib/email/sendInviteEmail'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as {
    familyId?: string
    email?: string
    inviteLink?: string
    familyName?: string
    role?: string
  }

  const familyId = body.familyId?.trim()
  const email = body.email?.trim().toLowerCase()
  const inviteLink = body.inviteLink?.trim()
  const familyName = body.familyName?.trim() || 'your family archive'
  const role = body.role === 'viewer' ? 'viewer' : 'editor'

  if (!familyId || !email || !inviteLink) {
    return NextResponse.json({ error: 'Missing invite details' }, { status: 400 })
  }

  const { data: isOwner, error: roleError } = await supabase.rpc('has_family_role', {
    target_family_id: familyId,
    allowed_roles: ['owner'],
  })

  if (roleError || !isOwner) {
    return NextResponse.json({ error: 'Only the family owner can send invites' }, { status: 403 })
  }

  const inviterName =
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    user.email?.split('@')[0] ||
    'Someone'

  try {
    await sendInviteEmail({
      to: email,
      inviteLink,
      familyName,
      inviterName,
      role,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not send email' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
