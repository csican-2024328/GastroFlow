import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { Card } from '../../../shared/components/Common';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import { useAuthStore } from '../../../shared/store/authStore';
import { validateOrderFields } from '../../../shared/store/orderCartStore';
import { useOrderCart } from '../hooks/useOrderCart';
import { useCoupons } from '../../coupons/hooks/useCoupons';
import { useEvents } from '../../events/hooks/useEvents';
import { COLORS } from '../../../shared/constants/theme';
import styles from './CheckoutDetailsScreen.styles';

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const TYPE_LABELS = {
  EN_MESA: 'En Mesa',
  A_DOMICILIO: 'A Domicilio',
  PARA_LLEVAR: 'Para Llevar',
};

const CheckoutDetailsScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const {
    restaurantId,
    items,
    tipoPedido,
    selectedTable,
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    scheduledTime,
    customerNotes,
    subtotal,
    discount,
    tax,
    total,
    setCustomerName,
    setCustomerPhone,
    setCustomerEmail,
    setDeliveryAddress,
    setScheduledTime,
    setCustomerNotes,
    appliedCoupon,
    appliedEvent,
  } = useOrderCart();
  const { alertProps, showAlert } = useAppAlert();
  const [couponInput, setCouponInput] = useState('');
  const { validateAndApplyCoupon, removeCoupon, loading: couponLoading } = useCoupons();
  const { removeEvent } = useEvents();

  useEffect(() => {
    if (!customerName && user?.name) setCustomerName(user.name);
  }, [customerName, user, setCustomerName]);

  const handleSelectTable = () => {
    navigation.navigate('SelectTable', { restaurantId });
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const result = await validateAndApplyCoupon(couponInput.trim(), restaurantId, subtotal);
    if (result.success) {
      showAlert('success', 'Cupón aplicado', result.message || 'Se ha aplicado el descuento.');
      setCouponInput('');
    } else {
      showAlert('error', 'Error de cupón', result.error || 'No se pudo aplicar el cupón.');
    }
  };

  const handleContinue = () => {
    const validation = validateOrderFields({
      restaurantId,
      items,
      tipoPedido,
      selectedTable,
      deliveryAddress,
      scheduledTime,
      customerPhone,
    });

    if (!validation.valid) {
      showAlert('error', 'Falta información', validation.message);
      return;
    }

    if (!customerName?.trim() && !user?.name) {
      showAlert('error', 'Falta información', 'Ingresa el nombre de quien recibe el pedido.');
      return;
    }

    navigation.navigate('Payment');
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Detalles del pedido</Text>
        <Text style={styles.subtitle}>{TYPE_LABELS[tipoPedido] || 'Selecciona un tipo de pedido'}</Text>

        {tipoPedido === 'EN_MESA' && (
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Mesa</Text>
            <Text style={styles.sectionValue}>
              {selectedTable ? `Mesa ${selectedTable.numero}` : 'Sin seleccionar'}
            </Text>
            <Button
              title={selectedTable ? 'Cambiar mesa' : 'Elegir mesa'}
              onPress={handleSelectTable}
              variant="secondary"
            />
          </Card>
        )}

        {(tipoPedido === 'A_DOMICILIO' || tipoPedido === 'PARA_LLEVAR') && (
          <Card style={styles.section}>
            <Input label="Nombre" value={customerName} onChangeText={setCustomerName} placeholder="Nombre completo" />
            <Input
              label="Teléfono"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="Ej. 5555-5555"
              keyboardType="phone-pad"
            />

            {tipoPedido === 'A_DOMICILIO' && (
              <>
                <Input
                  label="Email (opcional)"
                  value={customerEmail}
                  onChangeText={setCustomerEmail}
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Dirección de entrega"
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  placeholder="Dirección completa"
                />
              </>
            )}

            {tipoPedido === 'PARA_LLEVAR' && (
              <Input
                label="Hora de recogida (HH:MM)"
                value={scheduledTime}
                onChangeText={setScheduledTime}
                placeholder="Ej. 13:30"
              />
            )}

            <Input
              label="Notas especiales (opcional)"
              value={customerNotes}
              onChangeText={setCustomerNotes}
              placeholder="Ej. sin cebolla, el timbre no funciona..."
            />
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Código de cupón (opcional)</Text>
          <View style={styles.couponRow}>
            <View style={styles.couponInput}>
              <Input
                value={couponInput}
                onChangeText={setCouponInput}
                placeholder="Ej. BIENVENIDA10"
                autoCapitalize="characters"
              />
            </View>
            <Button 
              title={couponLoading ? "Validando..." : "Aplicar"} 
              onPress={handleApplyCoupon} 
              variant="secondary" 
              style={styles.couponButton} 
              disabled={couponLoading}
            />
          </View>
          {appliedCoupon && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: 8, backgroundColor: '#E8F5E9', borderRadius: 8 }}>
              <Text style={{ color: '#2E7D32', fontWeight: 'bold' }}>Cupón aplicado: {appliedCoupon.code}</Text>
              <TouchableOpacity onPress={() => removeCoupon()}>
                <Text style={{ color: '#C62828', fontWeight: 'bold', fontSize: 12 }}>Quitar</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ marginTop: 12 }}>
            <Button 
              title="Ver cupones vigentes" 
              onPress={() => navigation.navigate('Coupons', { restaurantId, fromCheckout: true })} 
              variant="outline" 
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Ofertas y Eventos Especiales</Text>
          {appliedEvent ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: '#E8F5E9', borderRadius: 8 }}>
              <Text style={{ color: '#2E7D32', fontWeight: 'bold' }}>Promo aplicada: {appliedEvent.name}</Text>
              <TouchableOpacity onPress={() => removeEvent()}>
                <Text style={{ color: '#C62828', fontWeight: 'bold', fontSize: 12 }}>Quitar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={{ fontSize: 13, color: COLORS.secondary, marginBottom: 8 }}>No tienes ninguna promoción aplicada.</Text>
          )}
          <View style={{ marginTop: 8 }}>
            <Button 
              title="Ver ofertas y eventos" 
              onPress={() => navigation.navigate('Events', { restaurantId, fromCheckout: true })} 
              variant="outline" 
            />
          </View>
        </Card>

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

        <Button title="Continuar" onPress={handleContinue} style={styles.confirmButton} />
      </ScrollView>
      <AppAlertModal {...alertProps} />
    </ScreenBackground>
  );
};

export default CheckoutDetailsScreen;
