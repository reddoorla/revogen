import { get, writable } from "svelte/store";

export const gradientTheme = writable(0);
export const defaultGradientTheme = writable(0);
export const defaultGradientColor = (color: string) => {
  switch (color) {
    case "light_blue": {
      defaultGradientTheme.set(0);
      break;
    }
    case "pink": {
      defaultGradientTheme.set(1);
      break;
    }
    case "dark_blue": {
      defaultGradientTheme.set(2);
      break;
    }
    case "teal": {
      defaultGradientTheme.set(3);
      break;
    }
  }
  gradientTheme.set(get(defaultGradientTheme));
};
