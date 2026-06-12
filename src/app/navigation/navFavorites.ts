import { useEffect, useState } from "react";

export const NAV_FAVORITES_STORAGE_PREFIX = "ome-nav-favorites-";
export const NAV_FAVORITES_CHANGE = "ome-nav-favorites-change";

export const NAV_ITEMS_WITHOUT_FAVORITE = new Set([
  "Overview",
  "Settings",
  "Documentation",
  "Catalog",
  "User Management",
]);

export function readNavFavoriteLabels(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${NAV_FAVORITES_STORAGE_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((label) => typeof label === "string");
  } catch {
    return [];
  }
}

export function writeNavFavoriteLabels(
  userId: string,
  favorites: string[],
): void {
  localStorage.setItem(
    `${NAV_FAVORITES_STORAGE_PREFIX}${userId}`,
    JSON.stringify(favorites),
  );
  window.dispatchEvent(
    new CustomEvent(NAV_FAVORITES_CHANGE, { detail: { userId } }),
  );
}

export function isNavFavorite(userId: string, label: string): boolean {
  return readNavFavoriteLabels(userId).includes(label);
}

export function reorderNavFavoriteLabels(
  userId: string,
  draggedLabel: string,
  targetLabel: string,
): string[] {
  const favorites = readNavFavoriteLabels(userId);
  const fromIndex = favorites.indexOf(draggedLabel);
  const toIndex = favorites.indexOf(targetLabel);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return favorites;
  }

  const next = [...favorites];
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, draggedLabel);
  writeNavFavoriteLabels(userId, next);
  return next;
}

export function toggleNavFavorite(userId: string, label: string): string[] {
  const favorites = readNavFavoriteLabels(userId);
  const next = favorites.includes(label)
    ? favorites.filter((entry) => entry !== label)
    : [...favorites, label];
  writeNavFavoriteLabels(userId, next);
  return next;
}

export function getOrderedFavoriteNavItems<T extends { label: string }>(
  items: T[],
  favoriteLabels: string[],
): T[] {
  const itemsByLabel = new Map(items.map((item) => [item.label, item]));
  return favoriteLabels
    .map((label) => itemsByLabel.get(label))
    .filter((item): item is T => item != null);
}

export function useNavFavoriteLabels(userId: string): string[] {
  const [favoriteLabels, setFavoriteLabels] = useState(() =>
    readNavFavoriteLabels(userId),
  );

  useEffect(() => {
    setFavoriteLabels(readNavFavoriteLabels(userId));
    const sync = () => setFavoriteLabels(readNavFavoriteLabels(userId));
    window.addEventListener(NAV_FAVORITES_CHANGE, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(NAV_FAVORITES_CHANGE, sync);
      window.removeEventListener("storage", sync);
    };
  }, [userId]);

  return favoriteLabels;
}
