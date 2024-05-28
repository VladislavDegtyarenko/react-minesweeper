import { useEffect, useState } from "react";

const SOUNDS_LIST = {
  REVEAL_EMPTY: "reveal_empty.wav",
  REVEAL_NUMBER: "reveal_number.wav",
  MARK_FLAG: "mark_flag.wav",
  MARK_QUESTION: "mark_question.wav",
  MARK_REMOVE: "mark_remove.wav",
  GAME_OVER: "game_over.wav",
  GAME_WIN: "game_win.wav",
};

type TSoundName = keyof typeof SOUNDS_LIST;
type TSoundsList = Record<TSoundName, HTMLAudioElement>;

const useSFX = () => {
  const [soundsList, setSoundsList] = useState<TSoundsList | null>(null);

  useEffect(() => {
    if (!soundsList) {
      const list = {} as TSoundsList;

      let sound: TSoundName;
      for (sound in SOUNDS_LIST) {
        list[sound] = new Audio(
          import.meta.env.BASE_URL + "sfx/" + SOUNDS_LIST[sound]
        );
      }

      setSoundsList(list);
    }
  }, [soundsList]);

  const playSoundEffect = (sfxName: TSoundName) => {
    try {
      const audioElement = soundsList![sfxName];
      // if (audioElement.HAVE_ENOUGH_DATA) {
      audioElement.currentTime = 0;
      audioElement.play();
      // }
    } catch (error) {
      console.warn("Unable to play sound: ", error);
    }
  };

  return { playSoundEffect };
};

export default useSFX;
