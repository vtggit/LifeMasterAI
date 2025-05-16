import axios from "axios";
import * as cheerio from "cheerio";
import { InsertDealItem, DealItem } from "@shared/schema";

interface ScrapedDeal {
  title: string;
  salePrice: number;
  originalPrice: number | null;
  imageUrl: string | null;
  discountPercentage: number | null;
  category: string | null;
  unit: string | null;
  validUntil: Date | null;
}

export async function scrapeGroceryDeals(storeUrl: string): Promise<ScrapedDeal[]> {
  try {
    // Example URL: https://www.kingsoopers.com/weeklyad/weeklyad
    const response = await axios.get(storeUrl);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // This is a simplified example - real scraper would need to be adapted to the specific site's structure
    const deals: ScrapedDeal[] = [];
    
    // Example selectors - these would need to be updated for the actual site
    $('.item-card').each((_, element) => {
      try {
        const titleElement = $(element).find('.item-title');
        const title = titleElement.text().trim();
        
        // Parse sale price
        const salePriceText = $(element).find('.sale-price').text().trim();
        const salePrice = parsePrice(salePriceText);
        
        // Parse original price if available
        const originalPriceText = $(element).find('.original-price').text().trim();
        const originalPrice = originalPriceText ? parsePrice(originalPriceText) : null;
        
        // Get image URL if available
        const imageElement = $(element).find('img');
        const imageUrl = imageElement.attr('src') || null;
        
        // Calculate discount percentage if both prices available
        let discountPercentage = null;
        if (originalPrice !== null && salePrice !== null) {
          discountPercentage = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
        }
        
        // Extract category if available
        const category = $(element).find('.category').text().trim() || null;
        
        // Extract unit if available (e.g., lb, oz, each)
        const unit = extractUnit(title) || null;
        
        // Extract valid until date if available
        const validUntilText = $(element).find('.valid-until').text().trim();
        const validUntil = validUntilText ? new Date(validUntilText) : null;
        
        deals.push({
          title,
          salePrice,
          originalPrice,
          imageUrl,
          discountPercentage,
          category,
          unit,
          validUntil
        });
      } catch (error) {
        console.error("Error processing deal item:", error);
      }
    });
    
    return deals;
  } catch (error) {
    console.error("Error scraping grocery deals:", error);
    throw new Error("Failed to scrape grocery deals");
  }
}

// Helper function to parse price string to number
function parsePrice(priceString: string): number {
  // Remove currency symbol, whitespace, and other non-numeric characters except decimal point
  const cleaned = priceString.replace(/[^\d.]/g, '');
  return parseFloat(cleaned);
}

// Helper function to extract unit from title
function extractUnit(title: string): string | null {
  const unitRegex = /\/(lb|oz|g|kg|each|bunch|pack|dozen)/i;
  const match = title.match(unitRegex);
  return match ? match[1].toLowerCase() : null;
}

// Function to simulate scraping when we can't actually scrape
// This is for demonstration purposes only
export function generateMockDeals(storeId: number, count: number = 10): InsertDealItem[] {
  const mockTitles = [
    "Organic Apples", "Lean Ground Beef", "Organic Whole Milk", "Barilla Pasta",
    "Fresh Strawberries", "Boneless Chicken Breasts", "Greek Yogurt", "Fresh Atlantic Salmon",
    "Organic Bananas", "Bell Peppers", "Avocados", "Cage-Free Large Eggs",
    "Whole Wheat Bread", "Organic Baby Spinach", "Cheddar Cheese Block", "Broccoli Crowns"
  ];
  
  const mockCategories = ["Produce", "Meat", "Dairy", "Pantry", "Bakery", "Frozen"];
  
  const mockUnits = ["lb", "oz", "each", "bunch", "pkg"];
  
  const deals: InsertDealItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const titleIndex = i % mockTitles.length;
    const title = mockTitles[titleIndex];
    const category = mockCategories[Math.floor(Math.random() * mockCategories.length)];
    const unit = mockUnits[Math.floor(Math.random() * mockUnits.length)];
    
    // Generate random prices
    const originalPrice = Math.round((2 + Math.random() * 8) * 100) / 100;
    const discountPercentage = Math.floor(Math.random() * 40) + 10; // 10-50% discount
    const salePrice = Math.round((originalPrice * (1 - discountPercentage / 100)) * 100) / 100;
    
    // Set valid until date to 7 days from now
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);
    
    // Pick a random image URL for demo purposes
    const imageUrl = getRandomFoodImageUrl(title);
    
    deals.push({
      storeId,
      title,
      category,
      salePrice,
      originalPrice,
      imageUrl,
      unit,
      discountPercentage,
      validUntil
    });
  }
  
  return deals;
}

// Helper function to get a random food image URL
function getRandomFoodImageUrl(title: string): string {
  // Map common food items to appropriate images - this is for demo only
  const imageMappings: Record<string, string> = {
    "Organic Apples": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    "Lean Ground Beef": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    "Organic Whole Milk": "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    "Fresh Strawberries": "https://pixabay.com/get/g08927b787b1cf2c9ee9f3918961d418a5ae324542e3e9d769cae44ab5562418ac9c2848307177c86300e6f12085a05347bf54852613d0d8f1a18475129e5fb84_1280.jpg",
    "Boneless Chicken Breasts": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    "Barilla Pasta": "https://pixabay.com/get/gbbb2fe0d4670391192b06ebb0e856ce508d445d1cc8b154433e41a4dba956216ff9c6e452df1af5df14dc069e4bfc0f94a1f44dd649dc67b3069cf332939879d_1280.jpg"
  };
  
  // Return matching image if available, otherwise a generic food image
  return imageMappings[title] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300";
}
