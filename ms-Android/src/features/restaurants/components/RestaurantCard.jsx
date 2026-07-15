import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { Card } from '../../../shared/components/Common';

const RestaurantCard = ({ restaurant, onPress }) => (
  <TouchableOpacity style={styles.touchable} onPress={onPress} activeOpacity={0.85}>
    <Card style={styles.card}>
      {restaurant.image ? (
        <Image source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>Sin imagen</Text>
        </View>
      )}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.info} numberOfLines={1}>{restaurant.address}</Text>
        <View style={styles.footer}>
          <Text style={styles.category} numberOfLines={1}>{restaurant.category || 'Restaurante'}</Text>
          <View style={[styles.statusBadge, restaurant.isAvailable ? styles.available : styles.unavailable]}>
            <Text style={styles.statusText}>{restaurant.isAvailable ? 'Abierto' : 'Cerrado'}</Text>
          </View>
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  touchable: {
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
    flexShrink: 1,
    marginRight: SPACING.sm,
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

export default RestaurantCard;
