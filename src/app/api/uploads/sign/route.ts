import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()

  const missing: string[] = []
  if (!cloudName) missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
  if (!apiKey) missing.push('CLOUDINARY_API_KEY')
  if (!apiSecret) missing.push('CLOUDINARY_API_SECRET')

  if (missing.length > 0) {
    return {
      missing,
      cloudName: null,
      apiKey: null,
      apiSecret: null,
    }
  }

  return {
    missing: [] as string[],
    cloudName: cloudName!,
    apiKey: apiKey!,
    apiSecret: apiSecret!,
  }
}

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

  const cloudinary = getCloudinaryConfig()
  if (cloudinary.missing.length > 0) {
    return NextResponse.json(
      {
        error: `Cloudinary is missing env vars: ${cloudinary.missing.join(', ')}. Add them in .env locally and in Vercel, then restart/redeploy.`,
      },
      { status: 500 },
    )
  }

  const { data: rpcMemory, error: rpcError } = await supabase.rpc('get_memory_for_upload', {
    p_memory_id: body.memoryId,
  })

  let memory = rpcMemory?.[0] ?? null

  if (!memory) {
    const { data: directMemory, error: directError } = await supabase
      .from('memories')
      .select('id, family_id')
      .eq('id', body.memoryId)
      .single()

    if (directError || !directMemory) {
      return NextResponse.json(
        {
          error:
            rpcError?.message ||
            directError?.message ||
            'Memory not found. Save the memory first, then retry the photo upload.',
        },
        { status: 404 },
      )
    }

    memory = directMemory
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = `life-archive/${memory.family_id}/${memory.id}`
  const toSign = `folder=${folder}&timestamp=${timestamp}${cloudinary.apiSecret}`
  const signature = createHash('sha1').update(toSign).digest('hex')

  return NextResponse.json({
    cloudName: cloudinary.cloudName,
    apiKey: cloudinary.apiKey,
    timestamp,
    folder,
    signature,
    memoryId: memory.id,
  })
}
