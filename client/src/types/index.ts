// User types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface FamilyMember {
  id: number;
  userId: number;
  name: string;
  color: string;
  isAdmin: boolean;
}

// Store types
export * from './stores';

// Legacy Store type for backward compatibility
export interface LegacyStore {
  id: number;
  userId: number;
  name: string;
  url?: string;
  isDefault: boolean;
}

// Dietary preferences types
export interface DietaryPreference {
  id: number;
  userId: number;
  allergies: string[];
  dietTypes: string[];
  dislikes: string[];
}

// Recipe types
export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  userId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  prepTime?: number;
  calories?: number;
  category?: string;
  isFavorite: boolean;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  createdAt: string;
}

export interface RecipeRating {
  id: number;
  recipeId: number;
  familyMemberId: number;
  rating: number;
}

export interface RecipeWithRatings extends Recipe {
  ratings: RecipeRating[];
}

// Meal Plan types
export interface MealPlan {
  id: number;
  userId: number;
  date: string;
  mealType: string;
  recipeId?: number;
  title: string;
  description?: string;
  calories?: number;
  prepTime?: number;
}

// Deal types
export interface DealItem {
  id: number;
  storeId: number;
  title: string;
  category?: string;
  salePrice: number;
  originalPrice: number;
  imageUrl?: string;
  unit?: string;
  discountPercentage?: number;
  validUntil?: string;
  createdAt: string;
}

// Shopping List types
export interface ShoppingList {
  id: number;
  userId: number;
  name: string;
  date: string;
  isCompleted: boolean;
}

export interface ShoppingListItem {
  id: number;
  shoppingListId: number;
  name: string;
  quantity: number;
  unit?: string;
  price?: number;
  isChecked: boolean;
  dealItemId?: number;
}

export interface ShoppingListWithItems extends ShoppingList {
  items: ShoppingListItem[];
}

// App Settings types
export interface AppSettings {
  id: number;
  userId: number;
  darkMode: boolean;
  enableNotifications: boolean;
  enableBudgetTracking: boolean;
  instacartConnected: boolean;
}

// AI Suggestion types
export interface MealSuggestion {
  title: string;
  description: string;
  imageUrl: string;
  dealItems: string[];
  tags: string[];
  rating: number;
}

export interface LeftoverSuggestion {
  title: string;
  description: string;
  additionalIngredients: string[];
  prepTime: number;
}

// UI Types
export interface MealTimeSlot {
  title: string;
  meal: MealPlan | null;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
}
