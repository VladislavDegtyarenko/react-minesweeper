export const get = (key: string) => {
  try {
    const data = localStorage.getItem(key);

    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(
      `Error retrieving data with key ${key} from localStorage:`,
      error
    );
    return null;
  }
};
