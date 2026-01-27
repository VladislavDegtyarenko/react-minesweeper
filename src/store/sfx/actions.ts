import { useSFXStore, SoundName, SOUNDS_CONFIG } from ".";

let isInitializing = false;

/**
 * Fetches and decodes a single audio file into an AudioBuffer.
 */
const loadAudioBuffer = async (
  audioContext: AudioContext,
  url: string
): Promise<AudioBuffer> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  return audioContext.decodeAudioData(arrayBuffer);
};

/**
 * Loads all audio buffers asynchronously.
 */
const loadAllAudioBuffers = async (context: AudioContext): Promise<void> => {
  const audioBuffers = new Map<SoundName, AudioBuffer>();

  const loadPromises = Object.entries(SOUNDS_CONFIG).map(
    async ([name, url]) => {
      const buffer = await loadAudioBuffer(context, url);
      audioBuffers.set(name as SoundName, buffer);
    }
  );

  await Promise.all(loadPromises);

  useSFXStore.setState({
    audioBuffers,
    isLoaded: true,
  });

  isInitializing = false;
};

/**
 * Initializes the Web Audio API context synchronously within user gesture,
 * then loads audio files asynchronously in the background.
 */
export const initSFX = (): void => {
  const { isLoaded, audioContext } = useSFXStore.getState();

  if (isLoaded || isInitializing) return;

  isInitializing = true;

  // Create AudioContext synchronously within the user gesture
  const context = audioContext ?? new AudioContext();

  // Resume if suspended (also synchronous within gesture)
  if (context.state === "suspended") {
    context.resume();
  }

  // Store context immediately so it's available
  useSFXStore.setState({ audioContext: context });

  // Load audio files in background (async, fire-and-forget)
  loadAllAudioBuffers(context);
};

/**
 * Plays a sound effect instantly from pre-decoded audio buffer.
 * Auto-initializes on first call if needed.
 */
export const playSFX = (soundName: SoundName): void => {
  const { isMuted, audioContext, audioBuffers, isLoaded } =
    useSFXStore.getState();

  if (isMuted) return;

  if (!isLoaded) {
    initSFX();

    return;
  }

  if (!audioContext) return;

  const buffer = audioBuffers.get(soundName);
  if (!buffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
};

/**
 * Toggles the mute state for sound effects.
 */
export const toggleMuteSFX = (): void => {
  const { isMuted } = useSFXStore.getState();

  useSFXStore.setState({ isMuted: !isMuted });
};
