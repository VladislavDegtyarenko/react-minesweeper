import { create } from "zustand";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { getDataFromLocalStorage } from "@/utils";

export const SOUNDS_CONFIG = {
  REVEAL_EMPTY: "/sfx/reveal_empty.wav",
  REVEAL_NUMBER: "/sfx/reveal_number.wav",
  FLAG_PLACE: "/sfx/flag_place.wav",
  FLAG_REMOVE: "/sfx/flag_remove.wav",
  GAME_OVER: "/sfx/game_over.wav",
  GAME_WIN: "/sfx/game_win.wav",
} as const;

export type SoundName = keyof typeof SOUNDS_CONFIG;

type SFXState = {
  isMuted: boolean;
  isLoaded: boolean;
  audioContext: AudioContext | null;
  audioBuffers: Map<SoundName, AudioBuffer>;
};

export const useSFXStore = create<SFXState>()(() => ({
  isMuted: getDataFromLocalStorage(LOCAL_STORAGE_KEYS.isMutedSFX) ?? false,
  isLoaded: false,
  audioContext: null,
  audioBuffers: new Map(),
}));
