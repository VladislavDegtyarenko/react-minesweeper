import { useRef, useState } from 'react';
import { MAX_IMAGE_FILE_SIZE_BYTES } from '@/utils/image';
import { createCx } from '@/utils';
import styles from './styles.module.scss';
import { useSettingsStore } from '@/store/settings';
import { selectIsTouchScreen } from '@/store/settings/selectors';

const cx = createCx(styles);

type Props = {
  onFileSelect: (file: File) => void;
  error: string | null;
};

const DropZone = ({ onFileSelect, error }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      setSizeError('File is too large. Maximum allowed size is 4 MB.');
      return;
    }

    setSizeError(null);
    onFileSelect(file);
  };

  return (
    <div
      className={cx('root', isDragging && 'dragging')}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <svg
        className={cx('icon')}
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p className={cx('label')}>
        {isTouchScreen ? 'Tap to upload' : 'Click to upload or drag and drop'}
      </p>
      <p className={cx('hint')}>JPEG, PNG or WebP · Max 4 MB</p>
      {sizeError ? <p className={cx('error')}>{sizeError}</p> : null}
      {!sizeError && error ? <p className={cx('error')}>{error}</p> : null}
    </div>
  );
};

export default DropZone;
