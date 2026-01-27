export const remove = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(
      `Error removing data with key ${key} from localStorage:`,
      error
    );
  }
};
