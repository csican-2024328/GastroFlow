import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/Common';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import SideDrawer from '../../../shared/components/SideDrawer';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { useAuthStore } from '../../../shared/store/authStore';
import { useRestaurants } from '../../restaurants/hooks/useRestaurants';

const QUICK_ACTIONS = [
  { key: 'order', label: 'Hacer pedido', icon: 'silverware-fork-knife' },
  { key: 'myOrders', label: 'Mis pedidos', icon: 'package-variant-closed' },
  { key: 'reviews', label: 'Mis reseñas', icon: 'star-outline' },
  { key: 'reservations', label: 'Reservaciones', icon: 'table-chair' },
  { key: 'coupons', label: 'Cupones', icon: 'ticket-percent-outline' },
  { key: 'events', label: 'Ofertas y Eventos', icon: 'party-popper' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const StatCard = ({ icon, label }) => (
  <Card style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
    <Text style={styles.statValue}>—</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

const QuickActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.actionIconWrapper}>
      <MaterialCommunityIcons name={icon} size={24} color={COLORS.primary} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const FeaturedRestaurantCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.7}>
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.featuredImage} resizeMode="cover" />
    ) : (
      <View style={[styles.featuredImage, styles.featuredPlaceholder]}>
        <MaterialCommunityIcons name="silverware-variant" size={28} color={COLORS.secondary} />
      </View>
    )}
    <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
    <Text style={styles.featuredCategory} numberOfLines={1}>{item.category || 'Restaurante'}</Text>
  </TouchableOpacity>
);

const DashboardScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const { restaurants, loading, error } = useRestaurants();
  const { alertProps, showAlert } = useAppAlert();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleComingSoon = (label) => {
    setDrawerVisible(false);
    showAlert('info', label, 'Esta sección estará disponible próximamente.');
  };

  const handleActionPress = (key, label) => {
    setDrawerVisible(false);
    if (key === 'reservations') {
      navigation.navigate('Reservations');
    } else if (key === 'myOrders') {
      navigation.navigate('MyOrders');
    } else if (key === 'reviews') {
      navigation.navigate('MyReviews');
    } else if (key === 'order') {
      navigation.navigate('RestaurantList');
    } else if (key === 'coupons') {
      navigation.navigate('Coupons');
    } else if (key === 'events') {
      navigation.navigate('Events');
    } else {
      handleComingSoon(label);
    }
  };

  const drawerItems = [
    { key: 'home', label: 'Inicio', icon: 'home', active: true, onPress: () => setDrawerVisible(false) },
    ...QUICK_ACTIONS.map((action) => ({
      ...action,
      onPress: () => handleActionPress(action.key, action.label),
    })),
  ];

  const featuredRestaurants = restaurants.slice(0, 9);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setDrawerVisible(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="menu" size={26} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>{getGreeting()}, {user?.name || 'Chef'} 👋</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="receipt" label="Pedidos" />
          <StatCard icon="heart-outline" label="Favoritos" />
          <StatCard icon="star" label="Rating" />
        </View>

        <Card style={styles.orderBanner}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={COLORS.secondary} />
          <View style={styles.orderBannerText}>
            <Text style={styles.orderBannerTitle}>No tienes pedidos activos</Text>
            <Text style={styles.orderBannerSubtitle}>Cuando hagas un pedido, aparecerá aquí</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <QuickActionButton
              key={action.key}
              icon={action.icon}
              label={action.label}
              onPress={() => handleActionPress(action.key, action.label)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Restaurantes destacados</Text>
        {loading && !restaurants.length ? (
          <LoadingSpinner />
        ) : error && !restaurants.length ? (
          <EmptyState message={error} />
        ) : (
          <FlatList
            data={featuredRestaurants}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <FeaturedRestaurantCard
                item={item}
                onPress={() =>
                  navigation.navigate('Restaurants', {
                    screen: 'RestaurantDetail',
                    params: { restaurantId: item._id },
                  })
                }
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            ListEmptyComponent={<EmptyState message="No hay restaurantes disponibles" />}
          />
        )}
      </ScrollView>
      <AppAlertModal {...alertProps} />
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        user={user}
        items={drawerItems}
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 0,
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    marginTop: 2,
  },
  orderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  orderBannerText: {
    flex: 1,
  },
  orderBannerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  orderBannerSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    width: '31%',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  featuredList: {
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  featuredCard: {
    width: 140,
    marginRight: SPACING.sm,
  },
  featuredImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
  },
  featuredPlaceholder: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  featuredCategory: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
  },
});

export default DashboardScreen;
