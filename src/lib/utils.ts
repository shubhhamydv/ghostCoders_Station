import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatXP = (xp: number) => {
  if (xp < 1000) return xp.toString();
  return (xp / 1000).toFixed(1) + "k";
};
