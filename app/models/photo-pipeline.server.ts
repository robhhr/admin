import {ExifDateTime, exiftool} from 'exiftool-vendored'
import {randomUUID} from 'node:crypto'
import {open, unlink} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import {putObject} from './r2.server'
import {tryCatch} from '~/utils'

// target widths for the srcset; smaller sources cap at their intrinsic width
export const DERIVATIVE_WIDTHS = [640, 1280, 2048]
const PLACEHOLDER_WIDTH = 24

export interface ProcessedPhoto {
  id: string
  storage_prefix: string
  width: number
  height: number
  widths: number[]
  placeholder: string
  taken_at: Date | null
  focal_length_mm: number | null
  aperture: number | null
  shutter_speed: string | null
  iso: number | null
  camera_model: string | null
  lens_model: string | null
}

async function isJpeg(filePath: string) {
  const file = await open(filePath)

  try {
    const {buffer} = await file.read(Buffer.alloc(3), 0, 3, 0)
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  } finally {
    await file.close()
  }
}

// exiftool is asked for these tags and nothing else, so gps, serial numbers
// and maker notes are never parsed into this process at all. -fast (the
// library default) skips trailing metadata, which matters on large raw files.
const EXIF_TAGS = [
  '-fast',
  '-DateTimeOriginal',
  '-CreateDate',
  '-FocalLength',
  '-FNumber',
  '-ExposureTime',
  '-ISO',
  '-Model',
  '-LensModel',
  '-LensID',
]

async function readExif(filePath: string) {
  const tags = await exiftool.read(filePath, {readArgs: EXIF_TAGS})

  const takenAt = tags.DateTimeOriginal ?? tags.CreateDate
  const focalLength = parseFloat(String(tags.FocalLength ?? ''))
  const aperture = Number(tags.FNumber)

  return {
    taken_at:
      takenAt instanceof ExifDateTime ? (takenAt.toDate() ?? null) : null,
    focal_length_mm: Number.isFinite(focalLength) ? focalLength : null,
    aperture: Number.isFinite(aperture) ? aperture : null,
    shutter_speed: tags.ExposureTime ? String(tags.ExposureTime) : null,
    iso: typeof tags.ISO === 'number' ? tags.ISO : null,
    camera_model: tags.Model ?? null,
    lens_model: tags.LensModel ?? tags.LensID ?? null,
  }
}

// RAF/NEF files embed a full-resolution jpeg preview; pull it out instead of
// decoding the raw sensor data (sharp can't, and we discard the raw anyway)
async function extractRawPreview(filePath: string) {
  const previewPath = path.join(tmpdir(), `preview-${randomUUID()}.jpg`)

  const jpgFromRaw = await tryCatch(
    exiftool.extractJpgFromRaw(filePath, previewPath),
  )

  if (jpgFromRaw.error) {
    const preview = await tryCatch(
      exiftool.extractPreview(filePath, previewPath),
    )

    if (preview.error) {
      console.error('error extracting raw preview:', preview.error)
      throw new Error('no embedded jpeg preview found in raw file')
    }
  }

  return previewPath
}

export async function processPhoto(filePath: string) {
  const id = randomUUID()
  const storagePrefix = `photos/${id}`
  let previewPath: string | null = null

  try {
    const exif = await readExif(filePath)

    // .rotate() bakes exif orientation into pixels; sharp then strips all
    // metadata (exif/gps/maker notes) from every derivative by default
    const source = (await isJpeg(filePath))
      ? sharp(filePath).rotate()
      : sharp((previewPath = await extractRawPreview(filePath))).rotate()

    // orientation >= 5 means the exif rotation is 90°/270°, so the stored
    // dimensions are swapped relative to what .rotate() will output
    const meta = await source.metadata()
    const swapped = (meta.orientation ?? 1) >= 5
    const intrinsicWidth = (swapped ? meta.height : meta.width) ?? 0

    const widths = DERIVATIVE_WIDTHS.filter(w => w <= intrinsicWidth)
    if (widths.length === 0) widths.push(intrinsicWidth)

    let largest = {width: 0, height: 0}

    for (const width of widths) {
      const resized = source.clone().resize({width})

      const avif = await resized
        .clone()
        .avif({quality: 55})
        .toBuffer({resolveWithObject: true})
      const jpeg = await resized
        .clone()
        .jpeg({quality: 78, mozjpeg: true})
        .toBuffer({resolveWithObject: true})

      await putObject(`${storagePrefix}/${width}.avif`, avif.data, 'image/avif')
      await putObject(`${storagePrefix}/${width}.jpg`, jpeg.data, 'image/jpeg')

      largest = {width: avif.info.width, height: avif.info.height}
    }

    const placeholder = await source
      .clone()
      .resize({width: PLACEHOLDER_WIDTH})
      .webp({quality: 40})
      .toBuffer()

    const processed: ProcessedPhoto = {
      id,
      storage_prefix: storagePrefix,
      width: largest.width,
      height: largest.height,
      widths,
      placeholder: `data:image/webp;base64,${placeholder.toString('base64')}`,
      ...exif,
    }

    return processed
  } finally {
    if (previewPath) await tryCatch(unlink(previewPath))
  }
}

export function derivativeKeys(storagePrefix: string, widths: number[]) {
  return widths.flatMap(w => [
    `${storagePrefix}/${w}.avif`,
    `${storagePrefix}/${w}.jpg`,
  ])
}
