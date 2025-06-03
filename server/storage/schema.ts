import { 
  integer, 
  text, 
  timestamp, 
  boolean, 
  json, 
  pgTable, 
  serial, 
  decimal, 
  date 
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Family members table
export const familyMembers = pgTable('family_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  color: text('color'),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Stores table
export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  url: text('url'),
  isDefault: boolean('is_default').default(false),
  config: json('config'),
  status: text('status').default('active'),
  errorMessage: text('error_message'),
  lastSync: timestamp('last_sync'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Dietary preferences table
export const dietaryPreferences = pgTable('dietary_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  allergies: json('allergies').$type<string[]>().default([]),
  dietTypes: json('diet_types').$type<string[]>().default([]),
  dislikes: json('dislikes').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Recipes table
export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  prepTime: integer('prep_time'),
  calories: integer('calories'),
  category: text('category'),
  isFavorite: boolean('is_favorite').default(false),
  tags: json('tags').$type<string[]>().default([]),
  ingredients: json('ingredients').$type<{
    name: string;
    quantity: number;
    unit: string;
  }[]>().notNull(),
  instructions: json('instructions').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Recipe ratings table
export const recipeRatings = pgTable('recipe_ratings', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').references(() => recipes.id).notNull(),
  familyMemberId: integer('family_member_id').references(() => familyMembers.id).notNull(),
  rating: integer('rating').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Meal plans table
export const mealPlans = pgTable('meal_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  date: date('date').notNull(),
  mealType: text('meal_type').notNull(),
  recipeId: integer('recipe_id').references(() => recipes.id),
  title: text('title').notNull(),
  description: text('description'),
  calories: integer('calories'),
  prepTime: integer('prep_time'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Deal items table
export const dealItems = pgTable('deal_items', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  title: text('title').notNull(),
  category: text('category'),
  salePrice: decimal('sale_price').notNull(),
  originalPrice: decimal('original_price').notNull(),
  imageUrl: text('image_url'),
  unit: text('unit'),
  discountPercentage: decimal('discount_percentage'),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Shopping lists table
export const shoppingLists = pgTable('shopping_lists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  date: date('date').notNull(),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Shopping list items table
export const shoppingListItems = pgTable('shopping_list_items', {
  id: serial('id').primaryKey(),
  shoppingListId: integer('shopping_list_id').references(() => shoppingLists.id).notNull(),
  name: text('name').notNull(),
  quantity: decimal('quantity').notNull(),
  unit: text('unit'),
  price: decimal('price'),
  isChecked: boolean('is_checked').default(false),
  dealItemId: integer('deal_item_id').references(() => dealItems.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// App settings table
export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  darkMode: boolean('dark_mode').default(false),
  enableNotifications: boolean('enable_notifications').default(true),
  enableBudgetTracking: boolean('enable_budget_tracking').default(false),
  instacartConnected: boolean('instacart_connected').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});