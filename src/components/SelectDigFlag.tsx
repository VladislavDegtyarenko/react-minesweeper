import { ControlModes, DigFlag, useSettingsStore } from "@/store/settings";
import { setDigFlag } from "@/store/settings/actions";
import { selectControlMode, selectDigFlag } from "@/store/settings/selectors";
import SelectButtons from "./ui/SelectButtons";

import classes from "./SelectDigFlag.module.scss";
import { DIG_FLAG_OPTIONS } from "@/store/settings/constants";

const SelectDigFlag = () => {
  const controlMode = useSettingsStore(selectControlMode);
  const digFlag = useSettingsStore(selectDigFlag);

  if (controlMode !== ControlModes.Toggle) {
    return null;
  }

  return (
    <SelectButtons<DigFlag>
      options={DIG_FLAG_OPTIONS}
      selectedOption={digFlag}
      onSelect={setDigFlag}
      className={classes.root}
    />
  );
};

export default SelectDigFlag;
