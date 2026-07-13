import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders } from '../hooks/useOrders';
import { COLORS } from '../../../shared/constants/theme';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import Button from '../../../shared/components/Button';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import PaymentModal from './PaymentModal';
import styles from './OrderTrackingScreen.styles';

const TRACKING_STEPS = [
  { key: 'PENDIENTE', label: 'Pendiente' },
  { key: 'EN_PREPARACION', label: 'En preparación' },
  { key: 'LISTO', label: 'Listo' },
  { key: 'ENTREGADO', label: 'Entregado' },
];

const STATUS_LABELS = {
  PENDIENTE: { label: 'Recibido', color: COLORS.warning, badgeBg: `${COLORS.warning}15`, icon: 'clock-outline' },
  EN_PREPARACION: { label: 'En preparación', color: '#E29578', badgeBg: '#E2957815', icon: 'stove' },
  LISTO: { label: 'Listo para pagar', color: COLORS.success, badgeBg: `${COLORS.success}15`, icon: 'check-circle-outline' },
  ENTREGADO: { label: 'Entregado', color: COLORS.secondary, badgeBg: `${COLORS.secondary}15`, icon: 'package-variant' },
  CANCELADO: { label: 'Cancelado', color: COLORS.error, badgeBg: `${COLORS.error}15`, icon: 'close-circle-outline' },
};

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const {
    selectedOrder,
    loading,
    updatingPayment,
    cancellingOrder,
    fetchOrderDetails,
    submitPayment,
    cancelOrderAction,
  } = useOrders();

  const { alertProps, showAlert } = useAppAlert();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const loadDetails = useCallback(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId, fetchOrderDetails]);

  // Load details on mount
  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  // Set up 6-second polling interval while order is active
  useEffect(() => {
    if (!orderId || !selectedOrder) return undefined;

    const isActive = ['PENDIENTE', 'EN_PREPARACION', 'LISTO'].includes(
      selectedOrder.estado?.toUpperCase()
    );

    if (!isActive) return undefined;

    const interval = setInterval(() => {
      fetchOrderDetails(orderId);
    }, 6000);

    return () => clearInterval(interval);
  }, [orderId, selectedOrder, fetchOrderDetails]);

  const order = selectedOrder;

  const statusInfo = useMemo(() => {
    if (!order) return { label: 'Desconocido', color: COLORS.secondary, badgeBg: `${COLORS.border}40`, icon: 'help-circle-outline' };
    return STATUS_LABELS[order.estado?.toUpperCase()] || {
      label: order.estado,
      color: COLORS.secondary,
      badgeBg: `${COLORS.border}40`,
      icon: 'help-circle-outline',
    };
  }, [order]);

  const currentProgress = useMemo(() => {
    if (!order) return 0;
    const est = order.estado?.toUpperCase();
    if (est === 'CANCELADO') return 0;
    if (est === 'ENTREGADO') return 4;
    if (est === 'LISTO') return 3;
    if (est === 'EN_PREPARACION') return 2;
    return 1; // PENDIENTE
  }, [order]);

  const canPay = useMemo(() => {
    if (!order) return false;
    const isPayableStatus = ['LISTO', 'ENTREGADO'].includes(order.estado?.toUpperCase());
    return isPayableStatus && order.metodoPago === 'PENDIENTE';
  }, [order]);

  const handlePayConfirm = async (paymentData) => {
    const result = await submitPayment(orderId, paymentData);
    if (result.success) {
      setIsPaymentOpen(false);
      showAlert('success', 'Pago Exitoso', 'Tu pago ha sido registrado y procesado correctamente.');
    } else {
      showAlert('error', 'Error de Pago', result.error);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancelar Pedido',
      '¿Estás seguro de que deseas cancelar este pedido?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelOrderAction(orderId, 'Cancelado por el cliente desde el móvil');
            if (result.success) {
              showAlert('success', 'Pedido Cancelado', 'Tu pedido ha sido cancelado correctamente.');
            } else {
              showAlert('error', 'Error al cancelar', result.error);
            }
          },
        },
      ]
    );
  };


  if (loading && !order) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <ScreenBackground>
        <EmptyState message="No se encontró la información del pedido." />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDetails} colors={[COLORS.primary]} />}
      >
        {/* Status Tracker */}
        <Card style={styles.trackingCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabelText}>Estado de la orden</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.badgeBg }]}>
              <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                {statusInfo.label.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Restaurant Details */}
          <View style={styles.restaurantInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Restaurante:</Text>
              <Text style={styles.infoValue}>
                {order.restaurantID?.name || order.restaurantID?.nombre || 'GastroFlow Rest.'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Mesa:</Text>
              <Text style={styles.infoValue}>
                {order.mesaID?.numero ? `Mesa ${order.mesaID.numero}` : 'Sin mesa asignada'}
              </Text>
            </View>
          </View>

          {/* Stepper progress bar */}
          {order.estado?.toUpperCase() !== 'CANCELADO' && (
            <View style={styles.progressRow}>
              {TRACKING_STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const isDone = currentProgress > stepNum;
                const isCurrent = currentProgress === stepNum;

                return (
                  <View key={step.key} style={styles.stepContainer}>
                    {/* Circle */}
                    <View
                      style={[
                        styles.stepCircle,
                        isCurrent && styles.stepCircleActive,
                        isDone && styles.stepCircleDone,
                      ]}
                    >
                      {isDone ? (
                        <MaterialCommunityIcons name="check" size={16} color={COLORS.background} />
                      ) : (
                        <Text
                          style={[
                            styles.stepCircleText,
                            isCurrent && styles.stepCircleTextActive,
                          ]}
                        >
                          {stepNum}
                        </Text>
                      )}
                    </View>

                    {/* Label */}
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelActive,
                        isDone && styles.stepLabelDone,
                      ]}
                      numberOfLines={1}
                    >
                      {step.label}
                    </Text>

                    {/* Line connection */}
                    {idx < TRACKING_STEPS.length - 1 && (
                      <View style={styles.stepLine}>
                        <View
                          style={[
                            styles.stepLineFill,
                            { width: currentProgress > stepNum ? '100%' : '0%' },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Desglose */}
        <Text style={styles.sectionTitle}>Artículos Pedidos</Text>
        <Card style={styles.itemsCard}>
          {order.items?.map((item, idx) => (
            <View key={`${item.plato || item.menu}-${idx}`} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{item.nombre}</Text>
                <Text style={styles.itemMeta}>
                  {item.cantidad} x {formatCurrency(item.precioUnitario)}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.subtotal ?? item.precioUnitario * item.cantidad)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Totales */}
        <Text style={styles.sectionTitle}>Totales de Cuenta</Text>
        <Card style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Impuestos</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.impuesto)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Descuentos</Text>
            <Text style={[styles.totalValue, { color: COLORS.error }]}>
              -{formatCurrency(order.descuento)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </Card>

        {/* Pago */}
        <Text style={styles.sectionTitle}>Gestión de Pago</Text>
        <Card style={styles.actionCard}>
          {canPay ? (
            <Button
              title="Pagar Pedido"
              onPress={() => setIsPaymentOpen(true)}
              loading={updatingPayment}
            />
          ) : order.metodoPago !== 'PENDIENTE' ? (
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>
                PAGADO CON {order.metodoPago?.toUpperCase()}
              </Text>
            </View>
          ) : (
            <Text style={styles.infoText}>
              El botón de pago se habilitará cuando el pedido esté listo.
            </Text>
          )}
        </Card>

        {/* Cancelar si está pendiente */}
        {order.estado?.toUpperCase() === 'PENDIENTE' && (
          <Button
            title="Cancelar Pedido"
            onPress={handleCancelOrder}
            variant="secondary"
            loading={cancellingOrder}
            style={{ borderColor: COLORS.error, borderWidth: 1, backgroundColor: 'transparent' }}
            titleStyle={{ color: COLORS.error }}
          />
        )}
      </ScrollView>

      {/* Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          order={order}
          onClose={() => setIsPaymentOpen(false)}
          onConfirm={handlePayConfirm}
          isSaving={updatingPayment}
        />
      )}

      {/* Alert Modals */}
      <AppAlertModal {...alertProps} />
    </ScreenBackground>
  );
};

export default OrderTrackingScreen;
