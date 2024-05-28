import clsx from "clsx";
import { LEVELS } from "../utils/constants";

type SelectedLevelProps = {
  level: string;
  changeLevel: (selectedLevelName: string) => void;
};

const SelectLevel = ({ level, changeLevel }: SelectedLevelProps) => {
  return (
    <ul className="select-level">
      {LEVELS.map(({ name }) => (
        <li key={name}>
          <button
            className={clsx(level === name && "active")}
            onClick={() => changeLevel(name)}
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SelectLevel;
