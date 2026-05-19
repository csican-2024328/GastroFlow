import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReviewForm, ReviewsList } from '../index.js';

export const ClientRestaurantReviewsPage = () => {
  const { restaurantId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!restaurantId) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: No se especificó restaurante</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Reseñas del Restaurante</h1>
      <p className="text-gray-600 mb-8">
        Comparte tu experiencia o lee lo que otros clientes dicen sobre este restaurante
      </p>

      {/* Form to create review */}
      <ReviewForm restaurantID={restaurantId} onReviewCreated={handleReviewCreated} />

      {/* List of reviews */}
      <ReviewsList key={refreshKey} restaurantID={restaurantId} />
    </div>
  );
};
