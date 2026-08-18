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
    mediaType: 'photo' | 'video' | 'audio' | 'document'
    providerAssetId: string
    url: string
    secureUrl: string
    thumbnailUrl?: string
    fileName?: string
    mimeType?: string
    bytes?: number
    width?: number
    height?: number
  }

  const { data, error } = await supabase
    .from('memory_media')
    .insert({
      memory_id: body.memoryId,
      media_type: body.mediaType,
      provider: 'cloudinary',
      provider_asset_id: body.providerAssetId,
      url: body.url,
      secure_url: body.secureUrl,
      thumbnail_url: body.thumbnailUrl,
      file_name: body.fileName,
      mime_type: body.mimeType,
      bytes: body.bytes,
      width: body.width,
      height: body.height,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
