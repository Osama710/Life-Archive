export function sanitizeFileName(fileName: string) {
  const base = fileName.split(/[/\\]/).pop() ?? "file";
  const cleaned = base.replace(/[^\w.\-()+ ]+/g, "_").trim();
  return cleaned || "file";
}

export function buildObjectKey(familyId: string, memoryId: string, fileName: string) {
  const safe = sanitizeFileName(fileName);
  const stamp = Date.now();
  return `life-archive/${familyId}/${memoryId}/${stamp}-${safe}`;
}

export function publicUrlForKey(publicDomain: string, key: string) {
  return `${publicDomain}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
