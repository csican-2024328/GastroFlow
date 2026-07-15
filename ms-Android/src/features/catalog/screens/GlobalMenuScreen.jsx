import { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/Common';
import Button from '../../../shared/components/Button';
import { COLORS } from '../../../shared/constants/theme';
import { useCatalog } from '../hooks/useCatalog';
import { useOrderCart } from '../../orders/hooks/useOrderCart';
import { useStockGuard } from '../../orders/hooks/useStockGuard';
import styles from './GlobalMenuScreen.styles';

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const GlobalMenuScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params || {};
  const { items, loading, error, fetchCatalog } = useCatalog();
  const { items: cartItems, restaurantId: cartRestaurantId } = useOrderCart();
  const { isBlocked, isChecking, requestIncrement, stockGuardState } = useStockGuard();
  const { alertProps, showAlert } = useAppAlert();

  useEffect(() => {
    fetchCatalog(restaurantId);
  }, [restaurantId, fetchCatalog]);

  const handleAddItem = (item) => {
    if (!item.disponible || isBlocked(item) || isChecking(item)) return;

    requestIncrement(
      { tipo: item.tipo, id: item.id, nombre: item.nombre, precioUnitario: item.precio },
      {
        onRejected: () =>
          showAlert(
            'info',
            'Límite de stock alcanzado',
            `Ya tienes la cantidad máxima disponible de "${item.nombre}" en tu carrito.`,
          ),
      },
    );
  };

  const renderItem = ({ item }) => {
    const blocked = isBlocked(item);
    const checking = isChecking(item);
    const disabled = !item.disponible || blocked;

    return (
      <TouchableOpacity activeOpacity={disabled || checking ? 1 : 0.8} onPress={() => handleAddItem(item)}>
        <Card style={[styles.itemCard, disabled && styles.itemCardDisabled]}>
          {item.foto ? (
            <Image source={{ uri: item.foto }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <MaterialCommunityIcons name="silverware-variant" size={26} color={COLORS.secondary} />
            </View>
          )}

          <View style={styles.itemInfo}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.nombre}
              </Text>
              <View style={[styles.badge, item.tipo === 'MENU' ? styles.badgeMenu : styles.badgePlato]}>
                <Text style={[styles.badgeText, item.tipo === 'MENU' ? styles.badgeTextMenu : styles.badgeTextPlato]}>
                  {item.tipo === 'MENU' ? 'MENÚ' : 'PLATO'}
                </Text>
              </View>
            </View>

            {!!item.descripcion && (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.descripcion}
              </Text>
            )}

            {!!item.restaurantNombre && <Text style={styles.restaurantName}>{item.restaurantNombre}</Text>}

            <View style={styles.itemFooter}>
              <Text style={styles.itemPrice}>{formatCurrency(item.precio)}</Text>
              {!item.disponible ? (
                <Text style={styles.unavailableText}>Agotado</Text>
              ) : blocked ? (
                <Text style={styles.unavailableText}>Límite alcanzado</Text>
              ) : checking ? (
                <Text style={styles.checkingText}>Verificando...</Text>
              ) : null}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Catálogo</Text>

        {loading && items.length === 0 ? (
          <LoadingSpinner />
        ) : error && items.length === 0 ? (
          <EmptyState message={error} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.tipo}-${item.id}`}
            renderItem={renderItem}
            extraData={stockGuardState}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState message="No hay productos disponibles por ahora." />}
          />
        )}

        {cartItems.length > 0 && (
          <View style={styles.cartBar}>
            <Button
              title={`Ir al carrito (${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'})`}
              onPress={() => navigation.navigate('MakeOrder', { restaurantId: cartRestaurantId })}
            />
          </View>
        )}
      </View>
      <AppAlertModal {...alertProps} />
    </ScreenBackground>
  );
};

export default GlobalMenuScreen;
