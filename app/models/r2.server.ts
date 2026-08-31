import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

// derivatives are keyed by immutable uuids and never overwritten,
// so browsers/CDN may cache them forever
const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

let client: S3Client | null = null

function getClient() {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      },
    })
  }

  return client
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
) {
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: IMMUTABLE_CACHE_CONTROL,
    }),
  )
}

export async function deleteObjects(keys: string[]) {
  if (keys.length === 0) return

  await getClient().send(
    new DeleteObjectsCommand({
      Bucket: process.env.R2_BUCKET,
      Delete: {Objects: keys.map(Key => ({Key})), Quiet: true},
    }),
  )
}
