import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: memberships } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const familyIds = (memberships || []).map((m) => m.family_id)
  if (familyIds.length === 0) {
    return NextResponse.json({
      exported_at: new Date().toISOString(),
      families: [],
      children: [],
      memories: [],
    })
  }

  const [{ data: families }, { data: children }, { data: memories }] = await Promise.all([
    supabase.from('families').select('*').in('id', familyIds).is('deleted_at', null),
    supabase.from('children').select('*').in('family_id', familyIds).is('deleted_at', null),
    supabase
      .from('memories')
      .select('*, memory_media(*)')
      .in('family_id', familyIds)
      .is('deleted_at', null)
      .order('memory_date', { ascending: false }),
  ])

  const payload = {
    exported_at: new Date().toISOString(),
    families: families || [],
    children: children || [],
    memories: memories || [],
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="life-archive-export-${Date.now()}.json"`,
    },
  })
}
