import { ControlModes, useSettingsStore } from "@/store/settings";
import { setControlMode } from "@/store/settings/actions";
import {
  selectControlMode,
  selectIsTouchScreen,
} from "@/store/settings/selectors";
import SelectButtons from "./ui/SelectButtons";

import classes from "./SelectControlMode.module.scss";
import { MOBILE_CONTROL_MODES_OPTIONS } from "@/store/settings/constants";

const SelectControlMode = () => {
  const controlMode = useSettingsStore(selectControlMode);
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);

  if (!isTouchScreen) {
    return null;
  }

  return (
    <div className={classes.root}>
      Control Mode:
      <SelectButtons<ControlModes>
        options={MOBILE_CONTROL_MODES_OPTIONS}
        selectedOption={controlMode}
        onSelect={setControlMode}
      />
    </div>
  );
};

export default SelectControlMode;
