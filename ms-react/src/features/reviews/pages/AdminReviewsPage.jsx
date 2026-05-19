import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReviewsAdminTable } from '../index.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';

export const AdminReviewsPage = () => {
  const { restaurantId: paramRestaurantId } = useParams();
  const { restaurantId: scopeRestaurantId, isRestaurantAdmin } = useRestaurantScope();
  
  const effectiveRestaurantId = isRestaurantAdmin ? scopeRestaurantId : paramRestaurantId;

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const loading = useRestaurantStore((s) => s.loading);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);

  useEffect(() => {
    if (restaurants.length === 0) {
      fetchRestaurants(1, 100);
    }
  }, []);

  useEffect(() => {
    if (effectiveRestaurantId && restaurants.length > 0) {
      const restaurant = restaurants.find((r) => r._id === effectiveRestaurantId);
      setSelectedRestaurant(restaurant);
    }
  }, [effectiveRestaurantId, restaurants]);

  return (
    <div className="p-6 md:p-8">
      {selectedRestaurant ? (
        <>
          <div className="mb-6 bg-[#FDFBF7] border border-[#E8D4B8] rounded-lg p-4">
            <p className="text-sm text-gray-600">Restaurante Seleccionado</p>
            <p className="text-lg font-semibold text-[#2D4F4F]">{selectedRestaurant.name}</p>
          </div>
          <ReviewsAdminTable restaurantID={effectiveRestaurantId} showRestaurant={!isRestaurantAdmin && !effectiveRestaurantId} />
        </>
      ) : (
        <ReviewsAdminTable restaurantID={effectiveRestaurantId} showRestaurant={!isRestaurantAdmin && !effectiveRestaurantId} />
      )}
    </div>
  );
};
