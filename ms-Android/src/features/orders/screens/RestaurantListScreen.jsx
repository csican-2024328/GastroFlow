import { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/Common';
import { COLORS } from '../../../shared/constants/theme';
import { useRestaurants } from '../../restaurants/hooks/useRestaurants';
import { useOrderCart } from '../hooks/useOrderCart';
import styles from './RestaurantListScreen.styles';

const RestaurantListScreen = ({ navigation }) => {
  const { restaurants, loading, error, refresh } = useRestaurants();
  const { resetForNewOrder, setRestaurantId } = useOrderCart();

  useEffect(() => {
    resetForNewOrder();
  }, [resetForNewOrder]);

  const handleSelectRestaurant = (restaurant) => {
    setRestaurantId(restaurant._id);
    navigation.navigate('GlobalMenu', { restaurantId: restaurant._id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => handleSelectRestaurant(item)}>
      <Card style={styles.card}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <MaterialCommunityIcons name="storefront-outline" size={24} color={COLORS.secondary} />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {item.category || 'Restaurante'}
          </Text>
          {!!item.address && (
            <Text style={styles.address} numberOfLines={1}>
              {item.address}
            </Text>
          )}
        </View>

        <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.secondary} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Elige un restaurante</Text>
        <Text style={styles.subtitle}>Selecciona dónde quieres hacer tu pedido</Text>

        {loading && restaurants.length === 0 ? (
          <LoadingSpinner />
        ) : error && restaurants.length === 0 ? (
          <EmptyState message={error} />
        ) : (
          <FlatList
            data={restaurants}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={refresh}
            ListEmptyComponent={<EmptyState message="No hay restaurantes disponibles." />}
          />
        )}
      </View>
    </ScreenBackground>
  );
};

export default RestaurantListScreen;
