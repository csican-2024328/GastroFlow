import { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useRestaurants } from '../hooks/useRestaurants';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { LoadingSpinner, EmptyState, Card } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';

const RestaurantCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
    <Card style={styles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>Sin imagen</Text>
        </View>
      )}
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.info}>{item.address}</Text>
        <View style={styles.footer}>
          <Text style={styles.category}>{item.category || 'Restaurante'}</Text>
          <View style={[styles.statusBadge, item.isAvailable ? styles.available : styles.unavailable]}>
            <Text style={styles.statusText}>{item.isAvailable ? 'Abierto' : 'Cerrado'}</Text>
          </View>
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

const RestaurantsScreen = ({ navigation }) => {
  const { restaurants, loading, error, getRestaurants } = useRestaurants();

  const onRefresh = useCallback(() => {
    getRestaurants();
  }, [getRestaurants]);

  if (loading && !restaurants.length) return <LoadingSpinner />;

  return (
    <ScreenBackground>
      {error && !restaurants.length ? (
        <EmptyState message={error} />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RestaurantCard
              item={item}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState message="No hay restaurantes disponibles" />}
        />
      )}
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING.md,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  placeholderImage: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  details: {
    padding: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  info: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  category: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  available: {
    backgroundColor: `${COLORS.success}20`,
  },
  unavailable: {
    backgroundColor: `${COLORS.error}20`,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default RestaurantsScreen;
