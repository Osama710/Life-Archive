export async function uploadMemoryMedia(memoryId: string, selected: File): Promise<void> {
  const signRes = await fetch('/api/uploads/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memoryId,
      fileName: selected.name,
      mimeType: selected.type || 'application/octet-stream',
    }),
  })
  const sign = await signRes.json()
  if (!signRes.ok) throw new Error(sign.error || 'Upload sign failed')

  const form = new FormData()
  form.append('file', selected)
  form.append('api_key', sign.apiKey)
  form.append('timestamp', String(sign.timestamp))
  form.append('signature', sign.signature)
  form.append('folder', sign.folder)

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
    { method: 'POST', body: form },
  )
  const cloud = await cloudRes.json()
  if (!cloudRes.ok) throw new Error(cloud.error?.message || 'Cloudinary upload failed')

  const completeRes = await fetch('/api/uploads/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memoryId,
      mediaType: selected.type.startsWith('video/') ? 'video' : 'photo',
      providerAssetId: cloud.public_id,
      url: cloud.url,
      secureUrl: cloud.secure_url,
      thumbnailUrl: cloud.secure_url,
      fileName: selected.name,
      mimeType: selected.type,
      bytes: cloud.bytes,
      width: cloud.width,
      height: cloud.height,
    }),
  })

  if (!completeRes.ok) {
    const err = await completeRes.json()
    throw new Error(err.error || 'Could not save media')
  }
}

export async function uploadMemoryMediaBatch(
  memoryId: string,
  files: File[],
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  for (let i = 0; i < files.length; i += 1) {
    onProgress?.(i + 1, files.length)
    await uploadMemoryMedia(memoryId, files[i]!)
  }
}
