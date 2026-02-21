import { UserMemory, Preference, UsualSpot, OrderHistoryEntry } from "@/types";

const STORAGE_KEY = "uber-eats-voice-memory";

const DEFAULT_MEMORY: UserMemory = {
  preferences: [],
  usualSpots: [],
  orderHistory: [],
};

export function getMemory(): UserMemory {
  if (typeof window === "undefined") return DEFAULT_MEMORY;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_MEMORY;
  return JSON.parse(raw) as UserMemory;
}

export function saveMemory(memory: UserMemory): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
}

export function addPreference(pref: Preference): void {
  const memory = getMemory();
  const exists = memory.preferences.some(
    (p) => p.ingredient === pref.ingredient && p.type === pref.type
  );
  if (!exists) {
    memory.preferences.push(pref);
    saveMemory(memory);
  }
}

export function addOrderToHistory(entry: OrderHistoryEntry): void {
  const memory = getMemory();
  memory.orderHistory.unshift(entry);
  if (memory.orderHistory.length > 50) memory.orderHistory.pop();
  saveMemory(memory);
}

export function updateUsualSpot(spot: UsualSpot): void {
  const memory = getMemory();
  const idx = memory.usualSpots.findIndex(
    (s) => s.cuisine === spot.cuisine
  );
  if (idx >= 0) {
    memory.usualSpots[idx] = spot;
  } else {
    memory.usualSpots.push(spot);
  }
  saveMemory(memory);
}

export function getApplicableRemovals(): string[] {
  const memory = getMemory();
  return memory.preferences
    .filter((p) => p.type === "remove" && p.scope === "global")
    .map((p) => p.ingredient);
}

export function seedDefaultMemory(): void {
  const memory = getMemory();
  if (memory.orderHistory.length > 0) return; // already seeded

  const seeded: UserMemory = {
    preferences: [
      { type: "remove", ingredient: "pickles", scope: "global" },
    ],
    usualSpots: [
      {
        cuisine: "shawarma",
        restaurantId: "shelbys",
        restaurantName: "Shelby's Shawarma",
        frequency: "high",
      },
    ],
    orderHistory: [
      {
        restaurantId: "shelbys",
        restaurantName: "Shelby's Shawarma",
        items: ["Chicken Shawarma Wrap"],
        date: "2026-02-10",
      },
      {
        restaurantId: "shelbys",
        restaurantName: "Shelby's Shawarma",
        items: ["Chicken Shawarma Wrap", "Hummus Plate"],
        date: "2026-02-05",
      },
      {
        restaurantId: "shelbys",
        restaurantName: "Shelby's Shawarma",
        items: ["Beef Shawarma Plate"],
        date: "2026-01-28",
      },
    ],
  };
  saveMemory(seeded);
}
