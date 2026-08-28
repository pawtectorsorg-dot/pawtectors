import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  showValue = false,
  className 
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const stars = [];
  
  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.floor(rating);
    const isPartial = i === Math.ceil(rating) && rating % 1 !== 0;
    const fillPercent = isPartial ? (rating % 1) * 100 : 0;

    stars.push(
      <div key={i} className="relative">
        {/* Background star (empty) */}
        <Star 
          className={cn(
            sizeClasses[size],
            'text-muted-foreground/30'
          )} 
        />
        {/* Foreground star (filled) */}
        {(isFilled || isPartial) && (
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ width: isFilled ? '100%' : `${fillPercent}%` }}
          >
            <Star 
              className={cn(
                sizeClasses[size],
                'text-amber-400 fill-amber-400'
              )} 
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {stars}
      {showValue && (
        <span className={cn('ml-1 font-medium text-foreground', textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
