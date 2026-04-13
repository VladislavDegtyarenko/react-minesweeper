import { isBrowser } from '../isBrowser';

export const remove = (key: string) => {
  try {
    if (!isBrowser()) {
      return;
    }

    localStorage.removeItem(key);
  } catch (error) {
    console.error(
      `Error removing data with key ${key} from localStorage:`,
      error
    );
  }
};
