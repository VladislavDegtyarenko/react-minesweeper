import clsx from "clsx";
import { LEVELS } from "../utils/constants";

type SelectedLevelProps = {
  level: string;
  changeLevel: (selectedLevelName: keyof typeof LEVELS) => void;
};

const SelectLevel = ({ level, changeLevel }: SelectedLevelProps) => {
  return (
    <ul className="select-level">
      {Object.keys(LEVELS).map((levelName) => (
        <li key={levelName}>
          <button
            className={clsx(level === levelName && "active")}
            onClick={() => changeLevel(levelName as keyof typeof LEVELS)}
          >
            {levelName}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SelectLevel;
