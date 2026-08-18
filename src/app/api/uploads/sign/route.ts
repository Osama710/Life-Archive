import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as {
    memoryId: string
    fileName: string
    mimeType: string
  }

  if (!body.memoryId || !body.fileName || !body.mimeType) {
    return NextResponse.json({ error: 'Invalid upload request' }, { status: 400 })
  }

  const { data: memory } = await supabase
    .from('memories')
    .select('id, family_id')
    .eq('id', body.memoryId)
    .single()
  if (!memory) return NextResponse.json({ error: 'Memory not found' }, { status: 404 })

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloud || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = `life-archive/${memory.family_id}/${memory.id}`
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(toSign).digest('hex')

  return NextResponse.json({
    cloudName: cloud,
    apiKey,
    timestamp,
    folder,
    signature,
    memoryId: memory.id,
  })
}
