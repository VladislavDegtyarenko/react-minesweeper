export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const MAX_IMAGE_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel body limit headroom)

export const AVATAR_CROP_OUTPUT_SIZE = 1024; // canvas output size; server downscales to 512
export const AVATAR_CROP_QUALITY = 0.9; // canvas JPEG quality before server recompresses

export const AVATAR_MAX_DIMENSION_PX = 512; // final output size from sharp
export const AVATAR_OUTPUT_MIME_TYPE = 'image/webp';
export const AVATAR_OUTPUT_EXTENSION = 'webp';
export const AVATAR_COMPRESSION_QUALITY = 80; // sharp quality (1–100)
