import clsx from "clsx";
import { LEVELS_CONFIG } from "@/constants";
import { useGameStore } from "@/store/game";
import { changeLevel } from "@/store/game/actions";

const SelectLevel = () => {
  const level = useGameStore((state) => state.level);

  return (
    <ul className="select-level">
      {LEVELS_CONFIG.map(({ id }) => (
        <li key={id}>
          <button
            className={clsx("button", "solid", level.id === id && "active")}
            onClick={() => changeLevel(id)}
          >
            {id}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SelectLevel;
