import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  onRate?: (rating: number) => void;
}

export default function Rating({ 
  value, 
  max = 5, 
  size = "md",
  onRate
}: RatingProps) {
  const sizesMap = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20
  };
  
  const iconSize = sizesMap[size];
  const isInteractive = !!onRate;
  
  const handleClick = (rating: number) => {
    if (onRate) {
      onRate(rating);
    }
  };
  
  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(value);
        
        return (
          <button
            key={i}
            type="button"
            className={`${
              isFilled ? 'text-amber-400' : 'text-gray-200'
            } ${isInteractive ? 'cursor-pointer' : ''}`}
            onClick={isInteractive ? () => handleClick(starValue) : undefined}
          >
            <Star size={iconSize} fill="currentColor" />
          </button>
        );
      })}
    </div>
  );
}
