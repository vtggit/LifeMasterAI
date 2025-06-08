import { 
  integer, 
  text, 
  real,
  blob,
  sqliteTable,
  type SQLiteTableFn
} from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Family members table
export const familyMembers = sqliteTable('family_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Stores table
export const stores = sqliteTable('stores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  url: text('url'),
  isDefault: integer('isDefault', { mode: 'boolean' }).default(false),
  config: text('config'),
  status: text('status').default('active'),
  errorMessage: text('errorMessage'),
  lastSync: text('lastSync'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

// Dietary preferences table
export const dietaryPreferences = sqliteTable('dietary_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  allergies: text('allergies'),
  dietTypes: text('diet_types'),
  dislikes: text('dislikes'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Recipes table
export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  prepTime: integer('prep_time'),
  calories: integer('calories'),
  category: text('category'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  tags: text('tags'),
  ingredients: text('ingredients').notNull(),
  instructions: text('instructions').notNull(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Recipe ratings table
export const recipeRatings = sqliteTable('recipe_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipeId: integer('recipe_id').notNull(),
  familyMemberId: integer('family_member_id').notNull(),
  rating: integer('rating').notNull(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Meal plans table
export const mealPlans = sqliteTable('meal_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  date: text('date').notNull(),
  mealType: text('meal_type').notNull(),
  recipeId: integer('recipe_id'),
  title: text('title').notNull(),
  description: text('description'),
  calories: integer('calories'),
  prepTime: integer('prep_time'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Deal items table
export const dealItems = sqliteTable('deal_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull(),
  title: text('title').notNull(),
  category: text('category'),
  salePrice: real('sale_price').notNull(),
  originalPrice: real('original_price').notNull(),
  imageUrl: text('image_url'),
  unit: text('unit'),
  discountPercentage: real('discount_percentage'),
  validUntil: text('valid_until'),
  createdAt: text('created_at'),
});

// Shopping lists table
export const shoppingLists = sqliteTable('shopping_lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Shopping list items table
export const shoppingListItems = sqliteTable('shopping_list_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shoppingListId: integer('shopping_list_id').notNull(),
  name: text('name').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit'),
  price: real('price'),
  isChecked: integer('is_checked', { mode: 'boolean' }).default(false),
  dealItemId: integer('deal_item_id'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// App settings table
export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  darkMode: integer('dark_mode', { mode: 'boolean' }).default(false),
  enableNotifications: integer('enable_notifications', { mode: 'boolean' }).default(true),
  enableBudgetTracking: integer('enable_budget_tracking', { mode: 'boolean' }).default(false),
  instacartConnected: integer('instacart_connected', { mode: 'boolean' }).default(false),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});