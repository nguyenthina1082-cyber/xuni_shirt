import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    })
  )

  return `${process.env.R2_PUBLIC_URL}/${fileName}`
}

export async function uploadBase64ImageToR2(
  base64Data: string,
  folder: string = "uploads"
): Promise<string> {
  const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("无效的 base64 格式");
  }

  const contentType = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");

  const extension = contentType.split("/")[1] || "png";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`;

  return uploadToR2(buffer, fileName, contentType);
}
