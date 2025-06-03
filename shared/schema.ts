import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Family member schema
export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  color: text("color").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({ id: true });
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

// Stores schema
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  url: text("url"),
  isDefault: boolean("is_default").default(false).notNull(),
  status: text("status").notNull(),
  config: json("config"),
  lastSync: timestamp("last_sync"),
  errorMessage: text("error_message")
});

export const insertStoreSchema = createInsertSchema(stores).omit({ id: true, lastSync: true, errorMessage: true });
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

// Dietary preferences schema
export const dietaryPreferences = pgTable("dietary_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  allergies: text("allergies").array(),
  dietTypes: text("diet_types").array(),
  dislikes: text("dislikes").array(),
});

export const insertDietaryPreferenceSchema = createInsertSchema(dietaryPreferences).omit({ id: true });
export type InsertDietaryPreference = z.infer<typeof insertDietaryPreferenceSchema>;
export type DietaryPreference = typeof dietaryPreferences.$inferSelect;

// Recipe schema
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  prepTime: integer("prep_time"),
  calories: integer("calories"),
  category: text("category"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  tags: text("tags").array(),
  ingredients: json("ingredients").notNull(),
  instructions: json("instructions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({ id: true, createdAt: true });
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;

// Recipe rating schema
export const recipeRatings = pgTable("recipe_ratings", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id),
  familyMemberId: integer("family_member_id").notNull().references(() => familyMembers.id),
  rating: integer("rating").notNull(),
});

export const insertRecipeRatingSchema = createInsertSchema(recipeRatings).omit({ id: true });
export type InsertRecipeRating = z.infer<typeof insertRecipeRatingSchema>;
export type RecipeRating = typeof recipeRatings.$inferSelect;

// Meal Plan schema
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  recipeId: integer("recipe_id").references(() => recipes.id),
  title: text("title").notNull(),
  description: text("description"),
  calories: integer("calories"),
  prepTime: integer("prep_time"),
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({ id: true });
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;

// Deal items schema
export const dealItems = pgTable("deal_items", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => stores.id),
  title: text("title").notNull(),
  category: text("category"),
  salePrice: real("sale_price"),
  originalPrice: real("original_price"),
  imageUrl: text("image_url"),
  unit: text("unit"), // e.g., lb, oz, each
  discountPercentage: integer("discount_percentage"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDealItemSchema = createInsertSchema(dealItems).omit({ id: true, createdAt: true });
export type InsertDealItem = z.infer<typeof insertDealItemSchema>;
export type DealItem = typeof dealItems.$inferSelect;

// Shopping list schema
export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({ id: true });
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingList = typeof shoppingLists.$inferSelect;

// Shopping list items schema
export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  shoppingListId: integer("shopping_list_id").notNull().references(() => shoppingLists.id),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit"),
  price: real("price"),
  isChecked: boolean("is_checked").default(false).notNull(),
  dealItemId: integer("deal_item_id").references(() => dealItems.id),
});

export const insertShoppingListItemSchema = createInsertSchema(shoppingListItems).omit({ id: true });
export type InsertShoppingListItem = z.infer<typeof insertShoppingListItemSchema>;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;

// User app settings schema
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  darkMode: boolean("dark_mode").default(false).notNull(),
  enableNotifications: boolean("enable_notifications").default(true).notNull(),
  enableBudgetTracking: boolean("enable_budget_tracking").default(true).notNull(),
  instacartConnected: boolean("instacart_connected").default(false).notNull(),
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({ id: true });
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
export type AppSettings = typeof appSettings.$inferSelect;
