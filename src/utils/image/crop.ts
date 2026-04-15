import { AVATAR_CROP_OUTPUT_SIZE, AVATAR_CROP_QUALITY } from './constants';

type CroppedAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const cropImageToFile = (
  imageSrc: string,
  croppedAreaPixels: CroppedAreaPixels,
  originalFileName: string,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onerror = () => reject(new Error('Failed to read the image file.'));

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = AVATAR_CROP_OUTPUT_SIZE;
      canvas.height = AVATAR_CROP_OUTPUT_SIZE;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Image compression failed. Please try a different file.'));
        return;
      }

      const { x, y, width, height } = croppedAreaPixels;
      ctx.drawImage(img, x, y, width, height, 0, 0, AVATAR_CROP_OUTPUT_SIZE, AVATAR_CROP_OUTPUT_SIZE);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image compression failed. Please try a different file.'));
            return;
          }

          const stem = originalFileName.replace(/\.[^.]+$/, '');
          const file = new File([blob], `${stem}.jpg`, { type: 'image/jpeg' });
          resolve(file);
        },
        'image/jpeg',
        AVATAR_CROP_QUALITY,
      );
    };

    img.src = imageSrc;
  });
};
