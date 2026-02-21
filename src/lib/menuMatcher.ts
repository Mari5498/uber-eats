import { Restaurant, MenuItem } from "@/types";

export function findRestaurant(
  restaurants: Restaurant[],
  name: string | null,
  excludeName: string | null,
  cuisineType: string | null
): Restaurant | null {
  if (!name && !cuisineType) return null;

  const candidates = excludeName
    ? restaurants.filter(
        (r) => !r.name.toLowerCase().includes(excludeName.toLowerCase())
      )
    : restaurants;

  if (name) {
    const match = candidates.find((r) =>
      r.name.toLowerCase().includes(name.toLowerCase())
    );
    if (match) return match;
  }

  if (cuisineType) {
    const match = candidates.find(
      (r) =>
        r.categories.some((c) =>
          c.toLowerCase().includes(cuisineType.toLowerCase())
        ) ||
        r.name.toLowerCase().includes(cuisineType.toLowerCase())
    );
    if (match) return match;
  }

  return candidates[0] || null;
}

export function findMenuItem(
  menu: MenuItem[],
  itemName: string
): MenuItem | null {
  const lower = itemName.toLowerCase();

  // Exact-ish match
  const exact = menu.find((m) => m.name.toLowerCase().includes(lower));
  if (exact) return exact;

  // Word overlap match
  const words = lower.split(/\s+/);
  let bestMatch: MenuItem | null = null;
  let bestScore = 0;

  for (const item of menu) {
    const itemWords = item.name.toLowerCase().split(/\s+/);
    const score = words.filter((w) =>
      itemWords.some((iw) => iw.includes(w) || w.includes(iw))
    ).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore > 0 ? bestMatch : menu[0];
}

export function applyPreferenceRemovals(
  modifiers: string[],
  removals: string[]
): { kept: string[]; removed: string[] } {
  const removed: string[] = [];
  const kept: string[] = [];

  for (const mod of modifiers) {
    if (removals.some((r) => mod.toLowerCase().includes(r.toLowerCase()))) {
      removed.push(mod);
    } else {
      kept.push(mod);
    }
  }

  return { kept, removed };
}
