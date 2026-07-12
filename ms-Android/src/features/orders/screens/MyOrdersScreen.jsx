import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders } from '../hooks/useOrders';
import { COLORS } from '../../../shared/constants/theme';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import Button from '../../../shared/components/Button';
import styles from './MyOrdersScreen.styles';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'EN_PREPARACION', label: 'Preparación' },
  { value: 'LISTO', label: 'Listos' },
  { value: 'ENTREGADO', label: 'Entregados' },
  { value: 'CANCELADO', label: 'Cancelados' },
];

const STATUS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: COLORS.warning, icon: 'clock-outline' },
  EN_PREPARACION: { label: 'En preparación', color: '#E29578', icon: 'stove' }, // Curated orange
  LISTO: { label: 'Listo', color: COLORS.success, icon: 'check-circle-outline' },
  ENTREGADO: { label: 'Entregado', color: COLORS.secondary, icon: 'package-variant' },
  CANCELADO: { label: 'Cancelado', color: COLORS.error, icon: 'close-circle-outline' },
};

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const MyOrdersScreen = ({ navigation }) => {
  const { orders, loading, fetchOrders } = useOrders();
  const [filter, setFilter] = useState('all');

  const loadOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.estado?.toUpperCase() === filter.toUpperCase());
  }, [orders, filter]);

  const renderOrderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.estado?.toUpperCase()] || {
      label: item.estado || 'Desconocido',
      color: COLORS.secondary,
      icon: 'help-circle-outline',
    };

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>Orden #{item.numeroOrden}</Text>
            <Text style={styles.restaurantName}>
              {item.restaurantID?.name || item.restaurantID?.nombre || 'Restaurante'}
            </Text>
          </View>
          <Text style={styles.totalText}>{formatCurrency(item.total)}</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}15`, borderColor: `${status.color}35` }]}>
            <MaterialCommunityIcons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${COLORS.border}40`, borderColor: 'transparent' }]}>
            <MaterialCommunityIcons name="tag-outline" size={14} color={COLORS.secondary} />
            <Text style={[styles.statusText, { color: COLORS.secondary }]}>
              {item.items?.length || 0} items
            </Text>
          </View>
        </View>

        {item.items && item.items.length > 0 && (
          <View style={styles.itemsPreview}>
            {item.items.map((prod, idx) => (
              <View key={`${prod.plato || prod.menu}-${idx}`} style={styles.itemChip}>
                <Text style={styles.itemChipText}>
                  {prod.cantidad}x {prod.nombre}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Button
          title="Ver seguimiento"
          onPress={() => navigation.navigate('OrderTracking', { orderId: item._id })}
          style={styles.trackBtn}
          variant="secondary"
        />
      </Card>
    );
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* Status Filters */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_OPTIONS.map((opt) => {
              const isActive = filter === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.filterTab, isActive && styles.filterTabActive]}
                  onPress={() => setFilter(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading && !orders.length ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadOrders}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                message={
                  filter === 'all'
                    ? 'Aún no tienes pedidos registrados.'
                    : 'No tienes pedidos con ese estado.'
                }
              />
            }
          />
        )}
      </View>
    </ScreenBackground>
  );
};

export default MyOrdersScreen;
