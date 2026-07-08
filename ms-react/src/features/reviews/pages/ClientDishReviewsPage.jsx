import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReviewForm, ReviewsList } from '../index.js';

export const ClientDishReviewsPage = () => {
  const { dishId, restaurantId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!dishId) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: No se especificó plato</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Reseñas del Plato</h1>
      <p className="text-gray-600 mb-8">
        Comparte tu opinión sobre este delicioso plato o lee las reseñas de otros clientes
      </p>

      {/* Form to create review */}
      <ReviewForm 
        platoID={dishId} 
        restaurantID={restaurantId}
        onReviewCreated={handleReviewCreated} 
      />

      {/* List of reviews for this dish */}
      <ReviewsList key={refreshKey} platoID={dishId} />
    </div>
  );
};
