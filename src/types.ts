export interface Modifier {
  name: string;
  removed: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  modifiers: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  categories: string[];
  menu: MenuItem[];
}

export interface Preference {
  type: "remove" | "add";
  ingredient: string;
  scope: "global";
}

export interface UsualSpot {
  cuisine: string;
  restaurantId: string;
  restaurantName: string;
  frequency: "high" | "medium" | "low";
}

export interface OrderHistoryEntry {
  restaurantId: string;
  restaurantName: string;
  items: string[];
  date: string;
}

export interface UserMemory {
  preferences: Preference[];
  usualSpots: UsualSpot[];
  orderHistory: OrderHistoryEntry[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  removedModifiers: string[];
  addedModifiers: string[];
}

export interface OrderResult {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  aiResponse: string;
}

export interface ParsedOrder {
  restaurantName: string | null;
  excludeRestaurant: string | null;
  requestRecommendation: boolean;
  cuisineType: string | null;
  items: {
    name: string;
    quantity: number;
    modifiersToRemove: string[];
    modifiersToAdd: string[];
  }[];
  newPreferences: Preference[];
  aiResponse: string;
}
