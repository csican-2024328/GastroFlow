import { useEffect } from 'react';
import { IngredientsPage } from './IngredientsPage.jsx';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { useIngredientStore } from '../store/useIngredientStore.js';
 
export const RestaurantIngredientsPage = () => {
  const { restaurantId }         = useRestaurantScope();
  const fetchIngredients         = useIngredientStore((s) => s.fetchIngredients);
  const setSelectedRestaurantId  = useIngredientStore((s) => s.setSelectedRestaurantId);
 
  useEffect(() => {
    setSelectedRestaurantId(restaurantId);
    if (restaurantId) fetchIngredients(restaurantId);
  }, [fetchIngredients, restaurantId, setSelectedRestaurantId]);
 
  return <IngredientsPage hideRestaurantFilter lockedRestaurantId={restaurantId} />;
};
 