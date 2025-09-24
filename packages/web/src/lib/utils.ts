// This file will contain utility functions for the application.
export const cn = (...classes: Array<string | undefined | null | false>) => {
  return classes.filter(Boolean).join(' ');
};
