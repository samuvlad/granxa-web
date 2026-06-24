import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function indexBy<T>(items: readonly T[], key: keyof T): Map<number, T> {
  const map = new Map<number, T>();
  for (const item of items) {
    const value = item[key];
    if (typeof value === "number") map.set(value, item);
  }
  return map;
}

export function uniqueBy<T, K>(items: readonly T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}
