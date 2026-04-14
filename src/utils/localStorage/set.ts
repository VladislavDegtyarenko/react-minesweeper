import { isBrowser } from '../isBrowser';

export const set = (key: string, data: unknown) => {
  try {
    if (!isBrowser()) {
      return;
    }

    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error setting data with key ${key} to localStorage:`, error);
  }
};
