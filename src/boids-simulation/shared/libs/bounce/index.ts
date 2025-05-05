export const debounce = (func: () => void, delay: number) => {
  let timeout: number | null = null;
  return () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(func, delay);
  };
};
