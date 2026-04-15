import { cropImageToFile, validateImage } from '@/utils/image';
import { useCallback, useState } from 'react';
import type { Area, Point } from 'react-easy-crop';

type Step = 'drop' | 'crop';

type Props = {
  onUpload: (file: File) => Promise<void>;
};

const DEFAULT_ORIGINAL_FILE_NAME = 'avatar';

export const useAvatarUploadDialog = ({ onUpload }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('drop');
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState(
    DEFAULT_ORIGINAL_FILE_NAME,
  );
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetState = useCallback(() => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setStep('drop');
    setObjectUrl(null);
    setOriginalFileName(DEFAULT_ORIGINAL_FILE_NAME);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
    setIsUploading(false);
  }, [objectUrl]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        resetState();
      }

      setIsOpen(open);
    },
    [resetState],
  );

  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    try {
      validateImage(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid file.');
      return;
    }

    const url = URL.createObjectURL(file);
    setOriginalFileName(file.name);
    setObjectUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setStep('crop');
  }, []);

  const handleCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleBack = useCallback(() => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setObjectUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
    setStep('drop');
  }, [objectUrl]);

  const handleUpload = useCallback(async () => {
    if (!objectUrl || !croppedAreaPixels) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const croppedFile = await cropImageToFile(
        objectUrl,
        croppedAreaPixels,
        originalFileName,
      );
      await onUpload(croppedFile);
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar.');
    } finally {
      setIsUploading(false);
    }
  }, [
    objectUrl,
    croppedAreaPixels,
    originalFileName,
    onUpload,
    handleOpenChange,
  ]);

  return {
    isOpen,
    step,
    objectUrl,
    crop,
    zoom,
    error,
    isUploading,
    handleOpenChange,
    handleFileSelect,
    handleCropComplete,
    handleBack,
    handleUpload,
    setCrop,
    setZoom,
  };
};
