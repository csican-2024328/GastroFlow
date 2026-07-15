import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import Button from '../../../shared/components/Button';
import { useRestaurants } from '../hooks/useRestaurants';

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} style={styles.infoIcon} />
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const { getRestaurantById, detailLoading, detailError } = useRestaurants({ autoFetch: false });
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    getRestaurantById(restaurantId)
      .then(setRestaurant)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleReservePress = () => {
    if (!restaurant) return;
    navigation.navigate('Reservations', {
      screen: 'NewReservation',
      params: { restaurant },
    });
  };

  if (detailLoading && !restaurant) return <LoadingSpinner />;

  if (detailError && !restaurant) {
    return (
      <ScreenBackground>
        <EmptyState message={detailError} />
      </ScreenBackground>
    );
  }

  if (!restaurant) return null;

  return (
    <ScreenBackground>
      <ScrollView>
        {restaurant.image ? (
          <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
        ) : (
          <View style={[styles.headerImage, styles.placeholder]}>
            <MaterialCommunityIcons name="silverware-variant" size={48} color={COLORS.secondary} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <View style={styles.badgeRow}>
              {!!restaurant.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{restaurant.category}</Text>
                </View>
              )}
              <View style={[styles.statusBadge, restaurant.isAvailable ? styles.available : styles.unavailable]}>
                <Text style={styles.statusText}>{restaurant.isAvailable ? 'Abierto' : 'Cerrado'}</Text>
              </View>
            </View>
          </View>

          <Card style={styles.infoCard}>
            <InfoRow icon="map-marker-outline" label="Dirección" value={`${restaurant.address || 'No disponible'}${restaurant.city ? `, ${restaurant.city}` : ''}`} />
            {!!restaurant.openingHours && (
              <InfoRow icon="clock-outline" label="Horario" value={restaurant.openingHours} />
            )}
            {!!restaurant.phone && <InfoRow icon="phone-outline" label="Teléfono" value={restaurant.phone} />}
            {!!restaurant.averagePrice && (
              <InfoRow icon="cash" label="Precio promedio" value={`Q${restaurant.averagePrice}`} />
            )}
          </Card>

          <Card style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>
              {restaurant.description || 'Disfruta de la mejor experiencia gastronómica.'}
            </Text>
          </Card>

          <Card style={styles.reviewsCard}>
            <View style={styles.reviewsHeader}>
              <View style={styles.reviewsHeaderLeft}>
                <MaterialCommunityIcons name="star" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.reviewsTitle}>Reseñas y Opiniones</Text>
              </View>
              <Button
                title="Ver"
                onPress={() => navigation.navigate('RestaurantReviews', { restaurantId, restaurantName: restaurant.name })}
                variant="secondary"
                style={{ height: 36, paddingVertical: 0, width: 80 }}
              />
            </View>
          </Card>

          <Button
            title="Reservar Mesa"
            onPress={handleReservePress}
            style={styles.reserveBtn}
          />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    width: '100%',
    height: 250,
  },
  placeholder: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: `${COLORS.primary}20`,
  },
  categoryBadgeText: {
    fontSize: FONT_SIZE.xs,
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
  infoCard: {
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: SPACING.sm,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  descriptionCard: {
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    lineHeight: 22,
  },
  reserveBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  reviewsCard: {
    marginBottom: SPACING.md,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default RestaurantDetailScreen;
