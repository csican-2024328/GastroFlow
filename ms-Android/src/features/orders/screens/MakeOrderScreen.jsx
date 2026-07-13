import { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import { Card, EmptyState } from '../../../shared/components/Common';
import Button from '../../../shared/components/Button';
import { useOrderCart } from '../hooks/useOrderCart';
import { useStockGuard } from '../hooks/useStockGuard';
import styles from './MakeOrderScreen.styles';

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const MakeOrderScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params || {};
  const {
    items,
    restaurantId: cartRestaurantId,
    subtotal,
    discount,
    tax,
    total,
    setRestaurantId,
    removeItem,
  } = useOrderCart();
  const { isBlocked, isChecking, requestIncrement, stockGuardState } = useStockGuard();

  useEffect(() => {
    if (restaurantId) setRestaurantId(restaurantId);
  }, [restaurantId, setRestaurantId]);

  const hasRestaurant = Boolean(restaurantId || cartRestaurantId);

  const handleIncrement = (item) => {
    if (isBlocked(item) || isChecking(item)) return;
    requestIncrement(item);
  };

  const handleDecrement = (item) => removeItem(item.tipo, item.id);
  const handleNext = () => navigation.navigate('OrderType');

  const renderItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.nombre}
          </Text>
          <Text style={styles.itemPrice}>{formatCurrency(item.precioUnitario)} c/u</Text>
        </View>
        <View style={styles.stepper}>
          <Button title="-" onPress={() => handleDecrement(item)} variant="secondary" style={styles.stepperButton} />
          <Text style={styles.stepperValue}>{item.cantidad}</Text>
          <Button
            title="+"
            onPress={() => handleIncrement(item)}
            loading={isChecking(item)}
            disabled={isChecking(item) || isBlocked(item)}
            style={[styles.stepperButton, isBlocked(item) && styles.stepperButtonBlocked]}
          />
        </View>
        <Text style={styles.itemSubtotal}>{formatCurrency(item.precioUnitario * item.cantidad)}</Text>
      </View>
      {isBlocked(item) && <Text style={styles.stockLimitText}>Límite de inventario alcanzado</Text>}
    </Card>
  );

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Tu pedido</Text>

        {!hasRestaurant ? (
          <EmptyState message="Agrega productos desde el catálogo para empezar tu pedido." />
        ) : items.length === 0 ? (
          <EmptyState message="Aún no has agregado productos a tu pedido." />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.tipo}-${item.id}`}
            renderItem={renderItem}
            extraData={stockGuardState}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        {hasRestaurant && items.length > 0 && (
          <>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Descuento</Text>
                <Text style={[styles.summaryValue, styles.summaryDiscount]}>-{formatCurrency(discount)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Impuesto</Text>
                <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
            </Card>

            <Button title="Siguiente" onPress={handleNext} style={styles.confirmButton} />
          </>
        )}
      </View>
    </ScreenBackground>
  );
};

export default MakeOrderScreen;
