import { useCallback, useEffect, useState } from "react";
import { useMuteSFX } from "./useMuteSFX";

const SOUNDS_LIST = {
  REVEAL_EMPTY: "reveal_empty.wav",
  REVEAL_NUMBER: "reveal_number.wav",
  FLAG_PLACE: "flag_place.wav",
  FLAG_REMOVE: "flag_remove.wav",
  GAME_OVER: "game_over.wav",
  GAME_WIN: "game_win.wav",
};

type TSoundName = keyof typeof SOUNDS_LIST;
type TSoundsList = Record<TSoundName, HTMLAudioElement>;

/**
 * Custom hook for managing sound effects in the game.
 * Handles loading, playing, and muting of game sounds.
 */
const useSFX = () => {
  const [soundsList, setSoundsList] = useState<TSoundsList | null>(null);
  const { isMutedSFX, toggleMuteSFX } = useMuteSFX();

  useEffect(() => {
    if (!soundsList) {
      const list = {} as TSoundsList;

      let sound: TSoundName;
      for (sound in SOUNDS_LIST) {
        list[sound] = new Audio("/sfx/" + SOUNDS_LIST[sound]);
      }

      for (sound in SOUNDS_LIST) {
        list[sound].load();
      }

      setSoundsList(list);
    }
  }, [soundsList]);

  const playSoundEffect = useCallback(
    (sfxName: TSoundName) => {
      if (isMutedSFX) return;

      try {
        const audioElement = soundsList![sfxName];
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement.play();
      } catch (error) {
        console.warn("Unable to play sound: ", error);
      }
    },
    [soundsList, isMutedSFX]
  );

  return { playSoundEffect, isMutedSFX, toggleMuteSFX };
};

export default useSFX;
