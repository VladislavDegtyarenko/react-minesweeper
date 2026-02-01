import { useSettingsStore } from '@/store/settings';
import { adjustZoom } from '@/store/settings/actions';
import { selectZoom } from '@/store/settings/selectors';

import { ZOOM_OPTIONS } from '@/store/settings/constants';

import ToggleGroup from '@/components/ui/ToggleGroup';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';

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
    >
      {ZOOM_OPTIONS.map((option) => {
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            label={option.label}
          />
        );
      })}
    </ToggleGroup>
  );
};

export default ToggleGroupZoom;
