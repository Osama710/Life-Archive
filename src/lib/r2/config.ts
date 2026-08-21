export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
}

export function getR2Config(): R2Config | { missing: string[] } {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const publicDomain = process.env.R2_PUBLIC_DOMAIN?.trim();

  const missing: string[] = [];
  if (!accountId) missing.push("R2_ACCOUNT_ID");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!bucketName) missing.push("R2_BUCKET_NAME");
  if (!publicDomain) missing.push("R2_PUBLIC_DOMAIN");

  if (missing.length > 0) {
    return { missing };
  }

  return {
    accountId: accountId!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucketName: bucketName!,
    publicDomain: publicDomain!.replace(/\/$/, ""),
  };
}

export function r2ConfigError(missing: string[]) {
  return `Cloudflare R2 is missing env vars: ${missing.join(", ")}. Add them in .env.local and Vercel, then restart/redeploy.`;
}
