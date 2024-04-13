export const setLocalStorage = (itemStorage: string, data: string) => {
  const IS_SERVER = typeof window === "undefined";

  if (!IS_SERVER) {
    localStorage.setItem(itemStorage, data);
  }
};

export const removeLocalStorage = () => {
  const IS_SERVER = typeof window === "undefined";

  if (!IS_SERVER) {
    localStorage.clear();
  }
};