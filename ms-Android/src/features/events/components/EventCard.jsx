import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { Card } from '../../../shared/components/Common';
import Button from '../../../shared/components/Button';

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const EventCard = ({ item, fromCheckout, onApply }) => {
  const isPercentage = item.descuentoTipo === 'PORCENTAJE';
  const discountText = isPercentage ? `${item.descuentoValor}%` : formatCurrency(item.descuentoValor);
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const isSoldOut = item.cantidadMaximaUsos && item.usosActuales >= item.cantidadMaximaUsos;
  const isExpired = new Date(item.fechaFin) < new Date();
  const isNotAvailable = isSoldOut || isExpired || item.estado !== 'ACTIVA';

  return (
    <Card style={[styles.card, isNotAvailable && styles.inactiveCard]}>
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{item.tipo.replace('_', ' ')}</Text>
        </View>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discountText} OFF</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.nombre}</Text>
      <Text style={styles.description}>{item.descripcion}</Text>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="calendar" size={16} color={COLORS.secondary} />
          <Text style={styles.infoText}>
            Validez: {formatDate(item.fechaInicio)} al {formatDate(item.fechaFin)}
          </Text>
        </View>
        
        {item.cantidadMaximaUsos ? (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="ticket" size={16} color={COLORS.secondary} />
            <Text style={styles.infoText}>
              Usos: {item.usosActuales}/{item.cantidadMaximaUsos}
            </Text>
          </View>
        ) : null}
      </View>

      {item.condiciones ? (
        <View style={styles.conditionsContainer}>
          <Text style={styles.conditionsTitle}>Condiciones:</Text>
          <Text style={styles.conditionsText}>{item.condiciones}</Text>
        </View>
      ) : null}

      {fromCheckout ? (
        <View style={styles.actionContainer}>
          {isSoldOut && (
            <Text style={styles.errorText}>Esta promoción se ha agotado</Text>
          )}
          {isExpired && (
            <Text style={styles.errorText}>Esta promoción ha expirado</Text>
          )}
          <Button
            title="Aplicar Promoción"
            onPress={onApply}
            variant={isNotAvailable ? 'secondary' : 'primary'}
            disabled={isNotAvailable}
            style={styles.applyButton}
          />
        </View>
      ) : (
        <View style={styles.footer}>
          {isSoldOut ? (
            <View style={[styles.statusBadge, styles.soldOutBadge]}>
              <Text style={styles.soldOutText}>AGOTADA</Text>
            </View>
          ) : isExpired ? (
            <View style={[styles.statusBadge, styles.expiredBadge]}>
              <Text style={styles.expiredText}>EXPIRADA</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.activeBadge]}>
              <Text style={styles.activeText}>ACTIVA</Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badgeContainer: {
    backgroundColor: `${COLORS.secondary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.xs - 1,
    fontWeight: '700',
  },
  discountBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
  },
  conditionsContainer: {
    backgroundColor: `${COLORS.border}30`,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.xs,
  },
  conditionsTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  conditionsText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  actionContainer: {
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  applyButton: {
    width: '100%',
  },
  footer: {
    marginTop: SPACING.sm,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  activeText: {
    color: '#2E7D32',
    fontSize: FONT_SIZE.xs - 1,
    fontWeight: '700',
  },
  soldOutBadge: {
    backgroundColor: '#FFEBEE',
  },
  soldOutText: {
    color: '#C62828',
    fontSize: FONT_SIZE.xs - 1,
    fontWeight: '700',
  },
  expiredBadge: {
    backgroundColor: '#ECEFF1',
  },
  expiredText: {
    color: '#37474F',
    fontSize: FONT_SIZE.xs - 1,
    fontWeight: '700',
  },
});

export default EventCard;
