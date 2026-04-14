import { useSettingsStore } from '@/store/settings';
import { adjustZoom } from '@/store/settings/actions';
import { selectZoom } from '@/store/settings/selectors';

import { ZOOM_OPTIONS } from '@/store/settings/constants';

import ToggleGroup from '@/components/ui/ToggleGroup';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';
import { createCx } from '@/utils';
import styles from '../styles.module.scss';

const cx = createCx(styles);

const ToggleGroupZoom = () => {
  const zoom = useSettingsStore(selectZoom);

  const handleZoomChange = (value: string) => {
    if (value) {
      adjustZoom(Number(value));
    }
  };

  return (
    <ToggleGroup
      label="Zoom"
      type="single"
      value={zoom.toString()}
      defaultValue={zoom.toString()}
      aria-label="Zoom"
      onValueChange={handleZoomChange}
      loop={true}
      wrapperClassName={cx('zoomWrapper')}
      labelClassName={cx('zoomLabel')}
      className={cx('zoomGroup')}
    >
      {ZOOM_OPTIONS.map((option) => {
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            label={option.label}
            className={cx('zoomItem')}
          />
        );
      })}
    </ToggleGroup>
  );
};

export default ToggleGroupZoom;
