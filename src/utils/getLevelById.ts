import { LEVELS_CONFIG } from "@/constants";
import type { LevelId } from "@/types";

export const getLevelById = (levelId: LevelId) => {
  return LEVELS_CONFIG.find((level) => level.id === levelId)!;
};
