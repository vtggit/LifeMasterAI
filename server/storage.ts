import {
  users, type User, type InsertUser,
  familyMembers, type FamilyMember, type InsertFamilyMember,
  stores, type Store, type InsertStore,
  dietaryPreferences, type DietaryPreference, type InsertDietaryPreference,
  recipes, type Recipe, type InsertRecipe,
  recipeRatings, type RecipeRating, type InsertRecipeRating,
  mealPlans, type MealPlan, type InsertMealPlan,
  dealItems, type DealItem, type InsertDealItem,
  shoppingLists, type ShoppingList, type InsertShoppingList,
  shoppingListItems, type ShoppingListItem, type InsertShoppingListItem,
  appSettings, type AppSettings, type InsertAppSettings
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Family members
  getFamilyMembers(userId: number): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  updateFamilyMember(id: number, member: Partial<FamilyMember>): Promise<FamilyMember | undefined>;
  deleteFamilyMember(id: number): Promise<boolean>;
  
  // Stores
  getStores(userId: number): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<Store>): Promise<Store | undefined>;
  deleteStore(id: number): Promise<boolean>;
  
  // Dietary preferences
  getDietaryPreferences(userId: number): Promise<DietaryPreference | undefined>;
  createDietaryPreferences(prefs: InsertDietaryPreference): Promise<DietaryPreference>;
  updateDietaryPreferences(userId: number, prefs: Partial<DietaryPreference>): Promise<DietaryPreference | undefined>;
  
  // Recipes
  getRecipes(userId: number): Promise<Recipe[]>;
  getFavoriteRecipes(userId: number): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, recipe: Partial<Recipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;
  
  // Recipe ratings
  getRecipeRatings(recipeId: number): Promise<RecipeRating[]>;
  createRecipeRating(rating: InsertRecipeRating): Promise<RecipeRating>;
  updateRecipeRating(id: number, rating: Partial<RecipeRating>): Promise<RecipeRating | undefined>;
  
  // Meal plans
  getMealPlans(userId: number, startDate: Date, endDate: Date): Promise<MealPlan[]>;
  getMealPlan(id: number): Promise<MealPlan | undefined>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: number, mealPlan: Partial<MealPlan>): Promise<MealPlan | undefined>;
  deleteMealPlan(id: number): Promise<boolean>;
  
  // Deal items
  getDealItems(storeId: number): Promise<DealItem[]>;
  getDealItem(id: number): Promise<DealItem | undefined>;
  createDealItem(dealItem: InsertDealItem): Promise<DealItem>;
  updateDealItem(id: number, dealItem: Partial<DealItem>): Promise<DealItem | undefined>;
  deleteDealItem(id: number): Promise<boolean>;
  
  // Shopping lists
  getShoppingLists(userId: number): Promise<ShoppingList[]>;
  getShoppingList(id: number): Promise<ShoppingList | undefined>;
  createShoppingList(list: InsertShoppingList): Promise<ShoppingList>;
  updateShoppingList(id: number, list: Partial<ShoppingList>): Promise<ShoppingList | undefined>;
  deleteShoppingList(id: number): Promise<boolean>;
  
  // Shopping list items
  getShoppingListItems(shoppingListId: number): Promise<ShoppingListItem[]>;
  createShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem>;
  updateShoppingListItem(id: number, item: Partial<ShoppingListItem>): Promise<ShoppingListItem | undefined>;
  deleteShoppingListItem(id: number): Promise<boolean>;
  
  // App settings
  getAppSettings(userId: number): Promise<AppSettings | undefined>;
  createAppSettings(settings: InsertAppSettings): Promise<AppSettings>;
  updateAppSettings(userId: number, settings: Partial<AppSettings>): Promise<AppSettings | undefined>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private familyMembers = new Map<number, FamilyMember>();
  private stores = new Map<number, Store>();
  private dietaryPreferences = new Map<number, DietaryPreference>();
  private recipes = new Map<number, Recipe>();
  private recipeRatings = new Map<number, RecipeRating>();
  private mealPlans = new Map<number, MealPlan>();
  private dealItems = new Map<number, DealItem>();
  private shoppingLists = new Map<number, ShoppingList>();
  private shoppingListItems = new Map<number, ShoppingListItem>();
  private appSettings = new Map<number, AppSettings>();
  
  private currentIds = {
    users: 1,
    familyMembers: 1,
    stores: 1,
    dietaryPreferences: 1,
    recipes: 1,
    recipeRatings: 1,
    mealPlans: 1,
    dealItems: 1,
    shoppingLists: 1,
    shoppingListItems: 1,
    appSettings: 1
  };

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Family members methods
  async getFamilyMembers(userId: number): Promise<FamilyMember[]> {
    return Array.from(this.familyMembers.values()).filter(member => member.userId === userId);
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const id = this.currentIds.familyMembers++;
    const familyMember: FamilyMember = { ...member, id };
    this.familyMembers.set(id, familyMember);
    return familyMember;
  }

  async updateFamilyMember(id: number, member: Partial<FamilyMember>): Promise<FamilyMember | undefined> {
    const existing = this.familyMembers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...member };
    this.familyMembers.set(id, updated);
    return updated;
  }

  async deleteFamilyMember(id: number): Promise<boolean> {
    return this.familyMembers.delete(id);
  }

  // Stores methods
  async getStores(userId: number): Promise<Store[]> {
    return Array.from(this.stores.values()).filter(store => store.userId === userId);
  }

  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async createStore(store: InsertStore): Promise<Store> {
    const id = this.currentIds.stores++;
    const newStore: Store = { ...store, id };
    this.stores.set(id, newStore);
    return newStore;
  }

  async updateStore(id: number, store: Partial<Store>): Promise<Store | undefined> {
    const existing = this.stores.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...store };
    this.stores.set(id, updated);
    return updated;
  }

  async deleteStore(id: number): Promise<boolean> {
    return this.stores.delete(id);
  }

  // Dietary preferences methods
  async getDietaryPreferences(userId: number): Promise<DietaryPreference | undefined> {
    return Array.from(this.dietaryPreferences.values()).find(pref => pref.userId === userId);
  }

  async createDietaryPreferences(prefs: InsertDietaryPreference): Promise<DietaryPreference> {
    const id = this.currentIds.dietaryPreferences++;
    const newPrefs: DietaryPreference = { ...prefs, id };
    this.dietaryPreferences.set(id, newPrefs);
    return newPrefs;
  }

  async updateDietaryPreferences(userId: number, prefs: Partial<DietaryPreference>): Promise<DietaryPreference | undefined> {
    const existing = Array.from(this.dietaryPreferences.values()).find(p => p.userId === userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...prefs };
    this.dietaryPreferences.set(existing.id, updated);
    return updated;
  }

  // Recipes methods
  async getRecipes(userId: number): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => recipe.userId === userId);
  }

  async getFavoriteRecipes(userId: number): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => recipe.userId === userId && recipe.isFavorite);
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = this.currentIds.recipes++;
    const newRecipe: Recipe = { ...recipe, id, createdAt: new Date() };
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  async updateRecipe(id: number, recipe: Partial<Recipe>): Promise<Recipe | undefined> {
    const existing = this.recipes.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...recipe };
    this.recipes.set(id, updated);
    return updated;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    return this.recipes.delete(id);
  }

  // Recipe ratings methods
  async getRecipeRatings(recipeId: number): Promise<RecipeRating[]> {
    return Array.from(this.recipeRatings.values()).filter(rating => rating.recipeId === recipeId);
  }

  async createRecipeRating(rating: InsertRecipeRating): Promise<RecipeRating> {
    const id = this.currentIds.recipeRatings++;
    const newRating: RecipeRating = { ...rating, id };
    this.recipeRatings.set(id, newRating);
    return newRating;
  }

  async updateRecipeRating(id: number, rating: Partial<RecipeRating>): Promise<RecipeRating | undefined> {
    const existing = this.recipeRatings.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...rating };
    this.recipeRatings.set(id, updated);
    return updated;
  }

  // Meal plans methods
  async getMealPlans(userId: number, startDate: Date, endDate: Date): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values()).filter(plan => {
      return plan.userId === userId && 
        plan.date >= startDate && 
        plan.date <= endDate;
    });
  }

  async getMealPlan(id: number): Promise<MealPlan | undefined> {
    return this.mealPlans.get(id);
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const id = this.currentIds.mealPlans++;
    const newPlan: MealPlan = { ...mealPlan, id };
    this.mealPlans.set(id, newPlan);
    return newPlan;
  }

  async updateMealPlan(id: number, mealPlan: Partial<MealPlan>): Promise<MealPlan | undefined> {
    const existing = this.mealPlans.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...mealPlan };
    this.mealPlans.set(id, updated);
    return updated;
  }

  async deleteMealPlan(id: number): Promise<boolean> {
    return this.mealPlans.delete(id);
  }

  // Deal items methods
  async getDealItems(storeId: number): Promise<DealItem[]> {
    return Array.from(this.dealItems.values()).filter(item => item.storeId === storeId);
  }

  async getDealItem(id: number): Promise<DealItem | undefined> {
    return this.dealItems.get(id);
  }

  async createDealItem(dealItem: InsertDealItem): Promise<DealItem> {
    const id = this.currentIds.dealItems++;
    const newItem: DealItem = { ...dealItem, id, createdAt: new Date() };
    this.dealItems.set(id, newItem);
    return newItem;
  }

  async updateDealItem(id: number, dealItem: Partial<DealItem>): Promise<DealItem | undefined> {
    const existing = this.dealItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...dealItem };
    this.dealItems.set(id, updated);
    return updated;
  }

  async deleteDealItem(id: number): Promise<boolean> {
    return this.dealItems.delete(id);
  }

  // Shopping lists methods
  async getShoppingLists(userId: number): Promise<ShoppingList[]> {
    return Array.from(this.shoppingLists.values()).filter(list => list.userId === userId);
  }

  async getShoppingList(id: number): Promise<ShoppingList | undefined> {
    return this.shoppingLists.get(id);
  }

  async createShoppingList(list: InsertShoppingList): Promise<ShoppingList> {
    const id = this.currentIds.shoppingLists++;
    const newList: ShoppingList = { ...list, id };
    this.shoppingLists.set(id, newList);
    return newList;
  }

  async updateShoppingList(id: number, list: Partial<ShoppingList>): Promise<ShoppingList | undefined> {
    const existing = this.shoppingLists.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...list };
    this.shoppingLists.set(id, updated);
    return updated;
  }

  async deleteShoppingList(id: number): Promise<boolean> {
    return this.shoppingLists.delete(id);
  }

  // Shopping list items methods
  async getShoppingListItems(shoppingListId: number): Promise<ShoppingListItem[]> {
    return Array.from(this.shoppingListItems.values()).filter(item => item.shoppingListId === shoppingListId);
  }

  async createShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem> {
    const id = this.currentIds.shoppingListItems++;
    const newItem: ShoppingListItem = { ...item, id };
    this.shoppingListItems.set(id, newItem);
    return newItem;
  }

  async updateShoppingListItem(id: number, item: Partial<ShoppingListItem>): Promise<ShoppingListItem | undefined> {
    const existing = this.shoppingListItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...item };
    this.shoppingListItems.set(id, updated);
    return updated;
  }

  async deleteShoppingListItem(id: number): Promise<boolean> {
    return this.shoppingListItems.delete(id);
  }

  // App settings methods
  async getAppSettings(userId: number): Promise<AppSettings | undefined> {
    return Array.from(this.appSettings.values()).find(settings => settings.userId === userId);
  }

  async createAppSettings(settings: InsertAppSettings): Promise<AppSettings> {
    const id = this.currentIds.appSettings++;
    const newSettings: AppSettings = { ...settings, id };
    this.appSettings.set(id, newSettings);
    return newSettings;
  }

  async updateAppSettings(userId: number, settings: Partial<AppSettings>): Promise<AppSettings | undefined> {
    const existing = Array.from(this.appSettings.values()).find(s => s.userId === userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...settings };
    this.appSettings.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
