import * as Dialog from '@radix-ui/react-dialog';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';
import DropZone from './components/DropZone';
import CropStep from './components/CropStep';
import { useAvatarUploadDialog } from './hooks/useAvatarUploadDialog';

const cx = createCx(styles);

type Props = {
  isSaving: boolean;
  onUpload: (file: File) => Promise<void>;
};

const AvatarUploadDialog = ({ isSaving, onUpload }: Props) => {
  const {
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
  } = useAvatarUploadDialog({ onUpload });

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className={cx('trigger')}>Upload Avatar</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={cx('overlay')} />
        <Dialog.Content className={cx('content')} aria-describedby={undefined}>
          <Dialog.Title className={cx('title')}>Upload Avatar</Dialog.Title>

          {step === 'drop' && (
            <DropZone onFileSelect={handleFileSelect} error={error} />
          )}

          {step === 'crop' && objectUrl && (
            <CropStep
              imageSrc={objectUrl}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
          )}

          {step === 'crop' && error ? (
            <p className={cx('error')}>{error}</p>
          ) : null}

          <div className={cx('footer')}>
            {step === 'crop' && (
              <Button
                variant="ghost"
                type="button"
                isDisabled={isUploading}
                onClick={handleBack}
              >
                Back
              </Button>
            )}
            <Dialog.Close asChild>
              <Button variant="ghost" type="button" isDisabled={isUploading}>
                Cancel
              </Button>
            </Dialog.Close>
            {step === 'crop' && (
              <Button
                variant="primary"
                type="button"
                isDisabled={isUploading || isSaving}
                onClick={handleUpload}
              >
                {isUploading ? 'Uploading…' : 'Upload'}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AvatarUploadDialog;
