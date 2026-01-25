import { LEVELS_CONFIG } from "@/constants";
import { useGameStore } from "@/store/game";
import { changeLevel } from "@/store/game/actions";

import { memo } from "react";
import SelectButtons from "./ui/SelectButtons";

import classes from "./SelectLevel.module.scss";

const SelectLevel = memo(() => {
  const levelOptions = LEVELS_CONFIG.map((level) => ({
    value: level.id,
    label: level.label,
  }));
  const selectedLevelId = useGameStore((state) => state.level).id;

  return (
    <SelectButtons
      options={levelOptions}
      selectedOption={selectedLevelId}
      onSelect={changeLevel}
      className={classes.root}
    />
  );
});

export default SelectLevel;
