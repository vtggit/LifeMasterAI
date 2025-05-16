import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertFamilyMemberSchema, 
  insertStoreSchema,
  insertDietaryPreferenceSchema,
  insertRecipeSchema,
  insertRecipeRatingSchema,
  insertMealPlanSchema,
  insertDealItemSchema,
  insertShoppingListSchema,
  insertShoppingListItemSchema,
  insertAppSettingsSchema
} from "@shared/schema";
import { generateMockDeals } from "./services/scraper-service";
import { 
  generateMealSuggestions, 
  createRecipeFromItems,
  analyzeDietaryRequirements,
  suggestLeftoverUses
} from "./services/ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // AUTH ROUTES
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userInput.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userInput);
      
      // Create default app settings for the user
      await storage.createAppSettings({
        userId: user.id,
        darkMode: false,
        enableNotifications: true,
        enableBudgetTracking: true,
        instacartConnected: false
      });
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(400).json({ message: "Invalid login data" });
    }
  });

  // FAMILY MEMBER ROUTES
  app.get("/api/family-members", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const members = await storage.getFamilyMembers(userId);
      return res.status(200).json(members);
    } catch (error) {
      console.error("Error fetching family members:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/family-members", async (req: Request, res: Response) => {
    try {
      const memberInput = insertFamilyMemberSchema.parse(req.body);
      const member = await storage.createFamilyMember(memberInput);
      return res.status(201).json(member);
    } catch (error) {
      console.error("Error creating family member:", error);
      return res.status(400).json({ message: "Invalid family member data" });
    }
  });

  app.put("/api/family-members/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const memberInput = req.body;
      const member = await storage.updateFamilyMember(id, memberInput);
      
      if (!member) {
        return res.status(404).json({ message: "Family member not found" });
      }
      
      return res.status(200).json(member);
    } catch (error) {
      console.error("Error updating family member:", error);
      return res.status(400).json({ message: "Invalid family member data" });
    }
  });

  app.delete("/api/family-members/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const success = await storage.deleteFamilyMember(id);
      
      if (!success) {
        return res.status(404).json({ message: "Family member not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting family member:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // STORES ROUTES
  app.get("/api/stores", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const stores = await storage.getStores(userId);
      return res.status(200).json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/stores", async (req: Request, res: Response) => {
    try {
      const storeInput = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(storeInput);
      return res.status(201).json(store);
    } catch (error) {
      console.error("Error creating store:", error);
      return res.status(400).json({ message: "Invalid store data" });
    }
  });

  app.put("/api/stores/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const storeInput = req.body;
      const store = await storage.updateStore(id, storeInput);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      return res.status(200).json(store);
    } catch (error) {
      console.error("Error updating store:", error);
      return res.status(400).json({ message: "Invalid store data" });
    }
  });

  app.delete("/api/stores/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const success = await storage.deleteStore(id);
      
      if (!success) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting store:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // DIETARY PREFERENCES ROUTES
  app.get("/api/dietary-preferences", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const preferences = await storage.getDietaryPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "Dietary preferences not found" });
      }
      
      return res.status(200).json(preferences);
    } catch (error) {
      console.error("Error fetching dietary preferences:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/dietary-preferences", async (req: Request, res: Response) => {
    try {
      const preferencesInput = insertDietaryPreferenceSchema.parse(req.body);
      const preferences = await storage.createDietaryPreferences(preferencesInput);
      return res.status(201).json(preferences);
    } catch (error) {
      console.error("Error creating dietary preferences:", error);
      return res.status(400).json({ message: "Invalid dietary preferences data" });
    }
  });

  app.put("/api/dietary-preferences/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const preferencesInput = req.body;
      const preferences = await storage.updateDietaryPreferences(userId, preferencesInput);
      
      if (!preferences) {
        return res.status(404).json({ message: "Dietary preferences not found" });
      }
      
      return res.status(200).json(preferences);
    } catch (error) {
      console.error("Error updating dietary preferences:", error);
      return res.status(400).json({ message: "Invalid dietary preferences data" });
    }
  });

  // RECIPES ROUTES
  app.get("/api/recipes", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const favorites = req.query.favorites === "true";
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const recipes = favorites 
        ? await storage.getFavoriteRecipes(userId)
        : await storage.getRecipes(userId);
        
      return res.status(200).json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const recipe = await storage.getRecipe(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Get recipe ratings
      const ratings = await storage.getRecipeRatings(id);
      
      // Return recipe with ratings
      return res.status(200).json({ ...recipe, ratings });
    } catch (error) {
      console.error("Error fetching recipe:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/recipes", async (req: Request, res: Response) => {
    try {
      const recipeInput = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(recipeInput);
      return res.status(201).json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      return res.status(400).json({ message: "Invalid recipe data" });
    }
  });

  app.put("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const recipeInput = req.body;
      const recipe = await storage.updateRecipe(id, recipeInput);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      return res.status(200).json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      return res.status(400).json({ message: "Invalid recipe data" });
    }
  });

  app.delete("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const success = await storage.deleteRecipe(id);
      
      if (!success) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // RECIPE RATINGS ROUTES
  app.post("/api/recipe-ratings", async (req: Request, res: Response) => {
    try {
      const ratingInput = insertRecipeRatingSchema.parse(req.body);
      const rating = await storage.createRecipeRating(ratingInput);
      return res.status(201).json(rating);
    } catch (error) {
      console.error("Error creating recipe rating:", error);
      return res.status(400).json({ message: "Invalid recipe rating data" });
    }
  });

  app.put("/api/recipe-ratings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const ratingInput = req.body;
      const rating = await storage.updateRecipeRating(id, ratingInput);
      
      if (!rating) {
        return res.status(404).json({ message: "Recipe rating not found" });
      }
      
      return res.status(200).json(rating);
    } catch (error) {
      console.error("Error updating recipe rating:", error);
      return res.status(400).json({ message: "Invalid recipe rating data" });
    }
  });

  // MEAL PLANS ROUTES
  app.get("/api/meal-plans", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      
      if (isNaN(userId) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Valid userId, startDate, and endDate are required" });
      }
      
      const mealPlans = await storage.getMealPlans(userId, startDate, endDate);
      return res.status(200).json(mealPlans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/meal-plans", async (req: Request, res: Response) => {
    try {
      const mealPlanInput = insertMealPlanSchema.parse(req.body);
      const mealPlan = await storage.createMealPlan(mealPlanInput);
      return res.status(201).json(mealPlan);
    } catch (error) {
      console.error("Error creating meal plan:", error);
      return res.status(400).json({ message: "Invalid meal plan data" });
    }
  });

  app.put("/api/meal-plans/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const mealPlanInput = req.body;
      const mealPlan = await storage.updateMealPlan(id, mealPlanInput);
      
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      return res.status(200).json(mealPlan);
    } catch (error) {
      console.error("Error updating meal plan:", error);
      return res.status(400).json({ message: "Invalid meal plan data" });
    }
  });

  app.delete("/api/meal-plans/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const success = await storage.deleteMealPlan(id);
      
      if (!success) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // DEAL ITEMS ROUTES
  app.get("/api/deal-items", async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.query.storeId as string);
      
      if (isNaN(storeId)) {
        return res.status(400).json({ message: "Valid storeId is required" });
      }
      
      // Get deal items from storage
      let dealItems = await storage.getDealItems(storeId);
      
      // If no deal items found, generate mock data for demo
      if (dealItems.length === 0) {
        const mockDeals = generateMockDeals(storeId);
        dealItems = await Promise.all(mockDeals.map(deal => storage.createDealItem(deal)));
      }
      
      return res.status(200).json(dealItems);
    } catch (error) {
      console.error("Error fetching deal items:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/deal-items", async (req: Request, res: Response) => {
    try {
      const dealItemInput = insertDealItemSchema.parse(req.body);
      const dealItem = await storage.createDealItem(dealItemInput);
      return res.status(201).json(dealItem);
    } catch (error) {
      console.error("Error creating deal item:", error);
      return res.status(400).json({ message: "Invalid deal item data" });
    }
  });

  // SHOPPING LISTS ROUTES
  app.get("/api/shopping-lists", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const shoppingLists = await storage.getShoppingLists(userId);
      return res.status(200).json(shoppingLists);
    } catch (error) {
      console.error("Error fetching shopping lists:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/shopping-lists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const shoppingList = await storage.getShoppingList(id);
      
      if (!shoppingList) {
        return res.status(404).json({ message: "Shopping list not found" });
      }
      
      // Get shopping list items
      const items = await storage.getShoppingListItems(id);
      
      // Return shopping list with items
      return res.status(200).json({ ...shoppingList, items });
    } catch (error) {
      console.error("Error fetching shopping list:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/shopping-lists", async (req: Request, res: Response) => {
    try {
      const shoppingListInput = insertShoppingListSchema.parse(req.body);
      const shoppingList = await storage.createShoppingList(shoppingListInput);
      return res.status(201).json(shoppingList);
    } catch (error) {
      console.error("Error creating shopping list:", error);
      return res.status(400).json({ message: "Invalid shopping list data" });
    }
  });

  app.put("/api/shopping-lists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const shoppingListInput = req.body;
      const shoppingList = await storage.updateShoppingList(id, shoppingListInput);
      
      if (!shoppingList) {
        return res.status(404).json({ message: "Shopping list not found" });
      }
      
      return res.status(200).json(shoppingList);
    } catch (error) {
      console.error("Error updating shopping list:", error);
      return res.status(400).json({ message: "Invalid shopping list data" });
    }
  });

  // SHOPPING LIST ITEMS ROUTES
  app.post("/api/shopping-list-items", async (req: Request, res: Response) => {
    try {
      const itemInput = insertShoppingListItemSchema.parse(req.body);
      const item = await storage.createShoppingListItem(itemInput);
      return res.status(201).json(item);
    } catch (error) {
      console.error("Error creating shopping list item:", error);
      return res.status(400).json({ message: "Invalid shopping list item data" });
    }
  });

  app.put("/api/shopping-list-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const itemInput = req.body;
      const item = await storage.updateShoppingListItem(id, itemInput);
      
      if (!item) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }
      
      return res.status(200).json(item);
    } catch (error) {
      console.error("Error updating shopping list item:", error);
      return res.status(400).json({ message: "Invalid shopping list item data" });
    }
  });

  app.delete("/api/shopping-list-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const success = await storage.deleteShoppingListItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting shopping list item:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // APP SETTINGS ROUTES
  app.get("/api/app-settings", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const settings = await storage.getAppSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "App settings not found" });
      }
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/app-settings/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const settingsInput = req.body;
      const settings = await storage.updateAppSettings(userId, settingsInput);
      
      if (!settings) {
        return res.status(404).json({ message: "App settings not found" });
      }
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Error updating app settings:", error);
      return res.status(400).json({ message: "Invalid app settings data" });
    }
  });

  // AI ROUTES
  app.post("/api/ai/meal-suggestions", async (req: Request, res: Response) => {
    try {
      const { dealItems, dietaryPreferences, count } = req.body;
      
      if (!dealItems || !Array.isArray(dealItems)) {
        return res.status(400).json({ message: "Valid dealItems array is required" });
      }
      
      const suggestions = await generateMealSuggestions(
        dealItems,
        dietaryPreferences || null,
        count || 3
      );
      
      return res.status(200).json(suggestions);
    } catch (error) {
      console.error("Error generating meal suggestions:", error);
      return res.status(500).json({ message: "Failed to generate meal suggestions" });
    }
  });

  app.post("/api/ai/analyze-dietary", async (req: Request, res: Response) => {
    try {
      const { recipes, dietaryPreferences } = req.body;
      
      if (!recipes || !Array.isArray(recipes) || !dietaryPreferences) {
        return res.status(400).json({ message: "Valid recipes array and dietaryPreferences are required" });
      }
      
      const analysis = await analyzeDietaryRequirements(recipes, dietaryPreferences);
      return res.status(200).json(analysis);
    } catch (error) {
      console.error("Error analyzing dietary requirements:", error);
      return res.status(500).json({ message: "Failed to analyze dietary requirements" });
    }
  });

  app.post("/api/ai/leftover-suggestions", async (req: Request, res: Response) => {
    try {
      const { ingredients, dietaryPreferences } = req.body;
      
      if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ message: "Valid ingredients array is required" });
      }
      
      const suggestions = await suggestLeftoverUses(ingredients, dietaryPreferences || null);
      return res.status(200).json(suggestions);
    } catch (error) {
      console.error("Error suggesting leftover uses:", error);
      return res.status(500).json({ message: "Failed to suggest leftover uses" });
    }
  });

  app.post("/api/ai/create-recipe", async (req: Request, res: Response) => {
    try {
      const recipeRequest = req.body;
      
      if (!recipeRequest.title || !recipeRequest.ingredients || !Array.isArray(recipeRequest.ingredients)) {
        return res.status(400).json({ message: "Valid title and ingredients array are required" });
      }
      
      const recipe = await createRecipeFromItems(recipeRequest);
      return res.status(200).json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      return res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
