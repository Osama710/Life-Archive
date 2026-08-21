import { S3Client } from "@aws-sdk/client-s3";
import { getR2Config, type R2Config } from "@/lib/r2/config";

export function createR2Client(config: R2Config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function getConfiguredR2Client():
  | { client: ReturnType<typeof createR2Client>; config: R2Config }
  | { missing: string[] } {
  const config = getR2Config();
  if ("missing" in config) {
    return { missing: config.missing };
  }
  return { client: createR2Client(config), config };
}
