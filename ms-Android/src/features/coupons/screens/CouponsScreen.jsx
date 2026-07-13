import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import Button from '../../../shared/components/Button';
import { useCoupons } from '../hooks/useCoupons';
import { useOrderCart } from '../../orders/hooks/useOrderCart';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const CouponsScreen = ({ route, navigation }) => {
  const { restaurantId, fromCheckout } = route.params || {};
  const { coupons, loading, error, fetchCoupons, validateAndApplyCoupon } = useCoupons();
  const { subtotal } = useOrderCart();
  const { alertProps, showAlert } = useAppAlert();

  useEffect(() => {
    fetchCoupons(restaurantId);
  }, [restaurantId, fetchCoupons]);

  const handleApplyCoupon = async (code) => {
    const result = await validateAndApplyCoupon(code, restaurantId, subtotal);
    if (result.success) {
      showAlert('success', 'Cupón Aplicado', result.message || 'El cupón se ha aplicado correctamente a tu pedido.');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } else {
      showAlert('error', 'Error al aplicar', result.error || 'No se pudo aplicar el cupón.');
    }
  };

  const handleShare = async (coupon) => {
    try {
      await Share.share({
        message: `¡Usa el cupón ${coupon.codigo} en GastroFlow para obtener un descuento del ${
          coupon.tipo === 'PORCENTAJE' ? `${coupon.porcentajeDescuento}%` : formatCurrency(coupon.montoFijo)
        }! Descargando GastroFlow.`,
      });
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const renderCouponItem = ({ item }) => {
    const isPercentage = item.tipo === 'PORCENTAJE';
    const discountText = isPercentage ? `${item.porcentajeDescuento}%` : formatCurrency(item.montoFijo);
    const dateFormatted = new Date(item.fechaExpiracion).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const meetsMinAmount = !fromCheckout || subtotal >= item.montoMinimo;

    return (
      <Card style={styles.couponCard}>
        <View style={styles.couponHeader}>
          <View style={styles.badgeContainer}>
            <Text style={styles.discountBadge}>{discountText} OFF</Text>
          </View>
          <TouchableOpacity onPress={() => handleShare(item)} style={styles.shareButton}>
            <MaterialCommunityIcons name="share-variant" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.codeText}>{item.codigo}</Text>
        <Text style={styles.descriptionText}>{item.descripcion || 'Sin descripción disponible'}</Text>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar-range" size={16} color={COLORS.secondary} />
            <Text style={styles.detailText}>Vence: {dateFormatted}</Text>
          </View>
          {item.montoMinimo > 0 && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="currency-usd" size={16} color={COLORS.secondary} />
              <Text style={styles.detailText}>Min: {formatCurrency(item.montoMinimo)}</Text>
            </View>
          )}
        </View>

        {fromCheckout ? (
          <View style={styles.actionContainer}>
            {!meetsMinAmount && (
              <Text style={styles.warningText}>
                Falta {formatCurrency(item.montoMinimo - subtotal)} más en tu pedido para usar este cupón.
              </Text>
            )}
            <Button
              title="Canjear Cupón"
              onPress={() => handleApplyCoupon(item.codigo)}
              variant={meetsMinAmount ? 'primary' : 'secondary'}
              disabled={!meetsMinAmount}
              style={styles.applyButton}
            />
          </View>
        ) : (
          <View style={styles.readOnlyContainer}>
            <Text style={styles.infoLabel}>
              {item.restaurantID ? 'Exclusivo del restaurante' : 'Válido en cualquier restaurante'}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cupones Disponibles</Text>
          <Text style={styles.subtitle}>
            {fromCheckout 
              ? 'Elige un cupón para aplicar a tu pedido actual' 
              : 'Ahorra en tus restaurantes favoritos con estos cupones'}
          </Text>
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <FlatList
            data={coupons}
            keyExtractor={(item) => item._id}
            renderItem={renderCouponItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyState message="No hay cupones vigentes en este momento." />}
          />
        )}
      </View>
      <AppAlertModal {...alertProps} />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  couponCard: {
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgeContainer: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountBadge: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  shareButton: {
    padding: 6,
  },
  codeText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1.5,
    marginVertical: SPACING.xs,
  },
  descriptionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
  },
  actionContainer: {
    marginTop: SPACING.xs,
  },
  warningText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  applyButton: {
    width: '100%',
  },
  readOnlyContainer: {
    backgroundColor: `${COLORS.secondary}10`,
    padding: SPACING.xs,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});

export default CouponsScreen;
