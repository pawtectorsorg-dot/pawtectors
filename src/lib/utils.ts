import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Default placeholder image shown when an `<img>` fails to load. */
export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400';

/** Attach as `onError` on any `<img>` to swap in the fallback on load failure. */
export const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  if (target.src !== FALLBACK_IMAGE) {
    target.src = FALLBACK_IMAGE;
  }
};
