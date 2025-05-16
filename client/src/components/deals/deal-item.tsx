import { Plus } from "lucide-react";
import { DealItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface DealItemProps {
  deal: DealItem;
  onAddToShoppingList?: (deal: DealItem) => void;
}

export default function DealItemCard({ deal, onAddToShoppingList }: DealItemProps) {
  const {
    title,
    salePrice,
    originalPrice,
    imageUrl,
    discountPercentage,
    unit,
    validUntil
  } = deal;

  // Format date if available
  const formattedDate = validUntil 
    ? new Date(validUntil).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) 
    : null;

  const handleAddToCart = () => {
    if (onAddToShoppingList) {
      onAddToShoppingList(deal);
    }
  };

  return (
    <Card className="rounded-lg border border-gray-100 overflow-hidden h-full">
      <div className="h-32 bg-gray-50 relative flex items-center justify-center">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title}
            className="h-24 w-auto object-contain"
          />
        )}
        
        {discountPercentage && discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center">
            {discountPercentage}% OFF
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-medium text-sm">{title}</h3>
        
        <div className="flex items-center mt-1">
          <span className="text-sm font-medium text-red-600">${salePrice.toFixed(2)}{unit ? `/${unit}` : ''}</span>
          {originalPrice && (
            <span className="text-xs text-gray-500 line-through ml-1">${originalPrice.toFixed(2)}{unit ? `/${unit}` : ''}</span>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-2">
          {formattedDate && (
            <span className="text-xs text-gray-500">Valid until {formattedDate}</span>
          )}
          
          <button 
            className="p-1.5 bg-primary text-white rounded-full"
            onClick={handleAddToCart}
          >
            <Plus size={16} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
