import OpenAI from "openai";
import axios from "axios";
import { DealItem, Recipe, DietaryPreference } from "@shared/schema";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export interface MealSuggestion {
  title: string;
  description: string;
  imageUrl: string;
  dealItems: string[]; // Names of sale items used
  tags: string[];
  rating: number;
}

export interface IngredientInfo {
  name: string;
  quantity: number;
  unit: string;
  isOnSale: boolean;
  storePrice?: number;
}

export interface RecipeCreationRequest {
  title: string;
  ingredients: IngredientInfo[];
  mealType: string;
  dietaryPreferences: Partial<DietaryPreference>;
}

export async function generateMealSuggestions(
  dealItems: DealItem[],
  dietaryPrefs: Partial<DietaryPreference> | null,
  count: number = 3
): Promise<MealSuggestion[]> {
  try {
    const dealItemsText = dealItems.map(item => 
      `${item.title}: $${item.salePrice} (was $${item.originalPrice})`
    ).join("\n");
    
    let dietaryPrefsText = "No specific dietary preferences.";
    if (dietaryPrefs) {
      dietaryPrefsText = [
        dietaryPrefs.allergies?.length ? `Allergies: ${dietaryPrefs.allergies.join(", ")}` : "",
        dietaryPrefs.dietTypes?.length ? `Diet Types: ${dietaryPrefs.dietTypes.join(", ")}` : "",
        dietaryPrefs.dislikes?.length ? `Dislikes: ${dietaryPrefs.dislikes.join(", ")}` : ""
      ].filter(Boolean).join("\n");
    }

    const prompt = `
      Generate ${count} meal suggestions based on these grocery store deals:
      
      ${dealItemsText}
      
      Dietary information:
      ${dietaryPrefsText}
      
      For each meal suggestion, provide:
      1. A title
      2. A brief description
      3. List of which sale items are used
      4. Tags (like "gluten-free", "high-protein", etc.)
      5. Expected popularity rating from 1-5
      
      Return as a JSON array where each suggestion has fields: title, description, dealItems (array), tags (array), and rating (number).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Add placeholder image URLs - in a real app these would be generated or retrieved from a proper source
    return result.suggestions.map((suggestion: any) => ({
      ...suggestion,
      imageUrl: getRandomFoodImageUrl(suggestion.title)
    }));
  } catch (error) {
    console.error("Error generating meal suggestions:", error);
    throw new Error("Failed to generate meal suggestions");
  }
}

export async function createRecipeFromItems(request: RecipeCreationRequest): Promise<Recipe> {
  try {
    const { title, ingredients, mealType, dietaryPreferences } = request;
    
    const ingredientsText = ingredients.map(ing => 
      `${ing.name} (${ing.quantity} ${ing.unit})${ing.isOnSale ? ' - ON SALE' : ''}`
    ).join("\n");
    
    let dietaryPrefsText = "No specific dietary preferences.";
    if (dietaryPreferences) {
      dietaryPrefsText = [
        dietaryPreferences.allergies?.length ? `Allergies: ${dietaryPreferences.allergies.join(", ")}` : "",
        dietaryPreferences.dietTypes?.length ? `Diet Types: ${dietaryPreferences.dietTypes.join(", ")}` : "",
        dietaryPreferences.dislikes?.length ? `Dislikes: ${dietaryPreferences.dislikes.join(", ")}` : ""
      ].filter(Boolean).join("\n");
    }

    const prompt = `
      Create a complete recipe for "${title}" (${mealType}) using these ingredients:
      
      ${ingredientsText}
      
      Dietary information:
      ${dietaryPrefsText}
      
      Provide the recipe with:
      1. A description
      2. Detailed ingredients list with quantities
      3. Step-by-step cooking instructions
      4. Estimated prep time and calories
      5. Appropriate tags
      
      Return as JSON with fields: description, prepTime (minutes), calories, category, tags (array), ingredients (array of objects with name, quantity, unit), and instructions (array of strings).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Create the recipe object
    return {
      id: 0, // This will be set by storage
      userId: 0, // This will be set by caller
      title,
      description: result.description,
      imageUrl: getRandomFoodImageUrl(title),
      prepTime: result.prepTime,
      calories: result.calories,
      category: result.category || mealType,
      isFavorite: false,
      tags: result.tags,
      ingredients: result.ingredients,
      instructions: result.instructions,
      createdAt: new Date()
    };
  } catch (error) {
    console.error("Error creating recipe:", error);
    throw new Error("Failed to create recipe");
  }
}

export async function analyzeDietaryRequirements(
  recipes: Recipe[], 
  dietaryPrefs: Partial<DietaryPreference>
): Promise<any> {
  try {
    const recipesText = recipes.map(recipe => 
      `${recipe.title}: ${recipe.ingredients.map((i: any) => i.name).join(", ")}`
    ).join("\n");
    
    let dietaryPrefsText = [
      dietaryPrefs.allergies?.length ? `Allergies: ${dietaryPrefs.allergies.join(", ")}` : "",
      dietaryPrefs.dietTypes?.length ? `Diet Types: ${dietaryPrefs.dietTypes.join(", ")}` : "",
      dietaryPrefs.dislikes?.length ? `Dislikes: ${dietaryPrefs.dislikes.join(", ")}` : ""
    ].filter(Boolean).join("\n");

    const prompt = `
      Analyze these recipes against dietary requirements:
      
      Recipes:
      ${recipesText}
      
      Dietary information:
      ${dietaryPrefsText}
      
      For each recipe, determine:
      1. If it's compliant with the dietary requirements
      2. What issues exist (if any)
      3. Possible substitutions for problem ingredients
      
      Return as a JSON object with recipe titles as keys, and values as objects with fields: compliant (boolean), issues (array), substitutions (array).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing dietary requirements:", error);
    throw new Error("Failed to analyze dietary requirements");
  }
}

export async function suggestLeftoverUses(
  ingredients: string[],
  dietaryPrefs: Partial<DietaryPreference> | null
): Promise<any> {
  try {
    const ingredientsText = ingredients.join(", ");
    
    let dietaryPrefsText = "No specific dietary preferences.";
    if (dietaryPrefs) {
      dietaryPrefsText = [
        dietaryPrefs.allergies?.length ? `Allergies: ${dietaryPrefs.allergies.join(", ")}` : "",
        dietaryPrefs.dietTypes?.length ? `Diet Types: ${dietaryPrefs.dietTypes.join(", ")}` : "",
        dietaryPrefs.dislikes?.length ? `Dislikes: ${dietaryPrefs.dislikes.join(", ")}` : ""
      ].filter(Boolean).join("\n");
    }

    const prompt = `
      Suggest 3 recipes to use these leftover ingredients:
      
      ${ingredientsText}
      
      Dietary information:
      ${dietaryPrefsText}
      
      For each suggestion, provide:
      1. Recipe title
      2. Brief description
      3. Additional ingredients needed
      4. Preparation time
      
      Return as a JSON array where each suggestion has fields: title, description, additionalIngredients (array), and prepTime (minutes).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error suggesting leftover uses:", error);
    throw new Error("Failed to suggest leftover uses");
  }
}

// Helper function to get a random food image URL for demo purposes
// In a real app, you'd use a proper food image API or database
function getRandomFoodImageUrl(title: string): string {
  const foodImages = [
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    "https://images.unsplash.com/photo-1546549032-9571cd6b27df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  ];
  
  // Use a hash of the title to create a consistent image for the same title
  const titleHash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return foodImages[titleHash % foodImages.length];
}
