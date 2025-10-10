import { useEffect, useState } from "react";
import { LOCAL_STORAGE_KEYS } from "../constants";
import { getDataFromLocalStorage, setDataToLocalStorage } from "../utils";

export const useMuteSFX = () => {
  const [isMutedSFX, setIsMutedSFX] = useState(
    getDataFromLocalStorage(LOCAL_STORAGE_KEYS.isMutedSFX) || false
  );

  const toggleMuteSFX = () => {
    setIsMutedSFX(!isMutedSFX);
  };

  useEffect(() => {
    setDataToLocalStorage(LOCAL_STORAGE_KEYS.isMutedSFX, isMutedSFX);
  }, [isMutedSFX]);

  return { isMutedSFX, toggleMuteSFX };
};
