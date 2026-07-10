import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_FILE_SIZE_BYTES } from './constants';

export const validateImage = (file: File): void => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error('File is too large. Maximum allowed size is 4 MB.');
  }
};
