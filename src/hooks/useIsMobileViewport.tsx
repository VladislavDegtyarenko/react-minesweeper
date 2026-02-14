import useWindowSize from './useWindowSize';

export const useIsMobileViewport = () => {
  const { width } = useWindowSize();

  return width < 768;
};
