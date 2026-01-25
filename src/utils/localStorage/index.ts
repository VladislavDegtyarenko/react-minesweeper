import { get } from "./get";
import { set } from "./set";
import { remove } from "./remove";

class LocalStorage {
  get<T>(key: string): T | null {
    return get(key);
  }

  set<T>(key: string, value: T) {
    return set(key, value);
  }

  remove(key: string) {
    return remove(key);
  }
}

export const localStorageService = new LocalStorage();
