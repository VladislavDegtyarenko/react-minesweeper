export const setDataToLocalStorage = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error setting data with key ${key} to localStorage:`, error);
  }
};
