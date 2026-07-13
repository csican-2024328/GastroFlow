import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { Card } from '../../../shared/components/Common';
import Button from '../../../shared/components/Button';
import { COLORS } from '../../../shared/constants/theme';
import { useOrderCart } from '../hooks/useOrderCart';
import { useCreateOrder } from '../hooks/useCreateOrder';
import styles from './PaymentScreen.styles';

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const METHODS = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: 'cash' },
  { value: 'TARJETA', label: 'Tarjeta', icon: 'credit-card' },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: 'bank' },
];

const PaymentScreen = ({ navigation }) => {
  const { subtotal, discount, tax, total, paymentMethod, setPaymentMethod } = useOrderCart();
  const { loading: creatingOrder, createOrderFromCart } = useCreateOrder();
  const { alertProps, showAlert } = useAppAlert();
  const [selectedMethod, setSelectedMethod] = useState(paymentMethod);

  const handleConfirm = async () => {
    if (!selectedMethod) {
      showAlert('error', 'Selecciona un método', 'Elige cómo quieres pagar tu pedido.');
      return;
    }

    setPaymentMethod(selectedMethod);

    const result = await createOrderFromCart();

    if (result.success) {
      const order = result.data?.data ?? result.data;
      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainBottomTabs' },
          { name: 'OrderSuccess', params: { orderId: order?._id, numeroOrden: order?.numeroOrden } },
        ],
      });
    } else {
      showAlert('error', 'No se pudo completar el pedido', result.error);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Método de pago</Text>
        <Text style={styles.subtitle}>Elige cómo vas a pagar tu pedido</Text>

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

        <Text style={styles.sectionTitle}>Método de pago</Text>
        {METHODS.map((method) => {
          const isSelected = selectedMethod === method.value;
          return (
            <TouchableOpacity key={method.value} onPress={() => setSelectedMethod(method.value)} activeOpacity={0.8}>
              <Card style={[styles.methodCard, isSelected && styles.methodCardSelected]}>
                <MaterialCommunityIcons
                  name={method.icon}
                  size={24}
                  color={isSelected ? COLORS.background : COLORS.primary}
                />
                <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>{method.label}</Text>
                {isSelected && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={COLORS.background}
                    style={styles.methodCheck}
                  />
                )}
              </Card>
            </TouchableOpacity>
          );
        })}

        <Button
          title={creatingOrder ? 'Procesando...' : 'Confirmar Pedido'}
          onPress={handleConfirm}
          loading={creatingOrder}
          disabled={creatingOrder || !selectedMethod}
          style={styles.confirmButton}
        />
      </View>
      <AppAlertModal {...alertProps} />
    </ScreenBackground>
  );
};

export default PaymentScreen;
