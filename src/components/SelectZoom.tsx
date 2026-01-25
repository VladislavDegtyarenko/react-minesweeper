import { ZOOM_OPTIONS } from "@/store/settings/constants";
import SelectButtons from "./ui/SelectButtons";
import { selectZoom } from "@/store/settings/selectors";
import { useSettingsStore } from "@/store/settings";

import classes from "./SelectZoom.module.scss";

const SelectZoom = () => {
  const zoom = useSettingsStore(selectZoom);

  const setZoom = (zoom: number) => {
    useSettingsStore.setState({ zoom });
  };

  return (
    <div className={classes.root}>
      <SelectButtons
        options={ZOOM_OPTIONS}
        selectedOption={zoom}
        onSelect={setZoom}
      />
    </div>
  );
};

export default SelectZoom;
