import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReviewsAdminTable } from '../index.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import '../../../styles/reviews.css';

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
    <>
      {selectedRestaurant ? (
        <div className="rw-rest-banner mb-6">
          <i className="ti ti-building-store" aria-hidden="true" />
          <div>
            <div className="rw-rest-banner-label">Restaurante seleccionado</div>
            <div className="rw-rest-banner-name">{selectedRestaurant.name}</div>
          </div>
        </div>
      ) : null}
      <ReviewsAdminTable restaurantID={effectiveRestaurantId} showRestaurant={!isRestaurantAdmin && !effectiveRestaurantId} />
    </>
  );
};
