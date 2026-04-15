import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  imageSrc: string;
  crop: Point;
  zoom: number;
  onCropChange: (crop: Point) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onZoomChange: (zoom: number) => void;
};

const CropStep = ({ imageSrc, crop, zoom, onCropChange, onCropComplete, onZoomChange }: Props) => {
  return (
    <div className={cx('cropContainer')}>
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={1}
        cropShape="round"
        showGrid={false}
        onCropChange={onCropChange}
        onCropComplete={onCropComplete}
        onZoomChange={onZoomChange}
      />
    </div>
  );
};

export default CropStep;
