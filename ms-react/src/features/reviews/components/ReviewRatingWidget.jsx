import { useEffect, useState } from 'react';
import { getReviews } from '../../../shared/api/reviewService.js';

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? '#2D4F4F' : 'none'}
          stroke="#2D4F4F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26 12 2"></polygon>
        </svg>
      ))}
    </div>
  );
};

export const ReviewRatingWidget = ({ restaurantID = null, platoID = null, showCount = true }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const params = {};
        if (restaurantID) params.restaurantID = restaurantID;
        if (platoID) params.platoID = platoID;

        const response = await getReviews(params);
        const reviews = response.data.data || [];

        if (reviews.length > 0) {
          const avgRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
          setAverageRating(parseFloat(avgRating));
          setReviewCount(reviews.length);
        } else {
          setAverageRating(0);
          setReviewCount(0);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantID || platoID) {
      fetchRating();
    }
  }, [restaurantID, platoID]);

  if (loading) {
    return <div className="text-xs text-gray-500">Cargando...</div>;
  }

  if (averageRating === 0 && reviewCount === 0) {
    return (
      <div className="text-xs text-gray-500">Sin reseñas</div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <StarRating rating={averageRating} />
          <span className="text-xs font-semibold text-[#2D4F4F]">
            {averageRating.toFixed(1)}
          </span>
        </div>
        {showCount && (
          <span className="text-xs text-gray-600">
            ({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})
          </span>
        )}
      </div>
    </div>
  );
};
