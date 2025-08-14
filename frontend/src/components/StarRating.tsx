import React from 'react';
import { Star, StarBorder } from '@mui/icons-material';

interface StarRatingProps {
  rating: number;
  showCount?: boolean;
  count?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  showCount = false, 
  count, 
  size = 'medium',
  color = '#FFD700'
}) => {
  // Don't show stars if rating is 0 or null/undefined
  if (!rating || rating === 0) {
    return null;
  }

  const maxStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  const sizeMap = {
    small: '16px',
    medium: '20px',
    large: '24px'
  };
  
  const fontSize = sizeMap[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(maxStars)].map((_, index) => {
          if (index < fullStars) {
            // Full star
            return (
              <Star
                key={index}
                style={{ 
                  color: color, 
                  fontSize: fontSize 
                }}
              />
            );
          } else if (index === fullStars && hasHalfStar) {
            // Half star (we'll use a full star with reduced opacity for simplicity)
            return (
              <Star
                key={index}
                style={{ 
                  color: color, 
                  fontSize: fontSize,
                  opacity: 0.5
                }}
              />
            );
          } else {
            // Empty star
            return (
              <StarBorder
                key={index}
                style={{ 
                  color: '#E0E0E0', 
                  fontSize: fontSize 
                }}
              />
            );
          }
        })}
      </div>
      
      {showCount && count && count > 0 && (
        <span style={{ 
          fontSize: size === 'small' ? '12px' : '14px',
          color: '#666',
          marginLeft: '4px'
        }}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default StarRating;