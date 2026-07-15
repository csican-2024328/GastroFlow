import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/theme';
import { Card } from '../../../shared/components/Common';
import Button from '../../../shared/components/Button';
import styles from './ReservationItem.styles';

const STATUS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: COLORS.warning, icon: 'clock-outline' },
  CONFIRMADA: { label: 'Confirmada', color: COLORS.success, icon: 'check-circle-outline' },
  CANCELADA: { label: 'Cancelada', color: COLORS.error, icon: 'close-circle-outline' },
  COMPLETADA: { label: 'Completada', color: COLORS.secondary, icon: 'checkbox-marked-circle-outline' },
};

const ReservationItem = ({ item, isExpanded, onToggle, onCancel }) => {
  const status = STATUS_CONFIG[item.estado?.toUpperCase()] || {
    label: item.estado || 'Pendiente',
    color: COLORS.primary,
    icon: 'help-circle-outline',
  };

  const isCancellable = ['PENDIENTE', 'CONFIRMADA'].includes(item.estado?.toUpperCase());

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Si dateStr ya es un ISO String (e.g. contiene 'T'), extraemos solo la parte YYYY-MM-DD
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const date = new Date(cleanDate + 'T00:00:00');
    
    // Si el parseo con T00:00:00 falla, intentamos con Date directo
    if (isNaN(date.getTime())) {
      const fallbackDate = new Date(dateStr);
      if (isNaN(fallbackDate.getTime())) {
        return 'Fecha inválida';
      }
      return fallbackDate.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={styles.cardHeader}
      >
        <View style={styles.headerInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.restaurantID?.name || item.restaurantName || 'Restaurante'}
          </Text>
          
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar" size={14} color={COLORS.secondary} />
            <Text style={styles.metaText}>{formatDate(item.fechaReserva || item.fecha)}</Text>
            <View style={styles.bullet} />
            <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.secondary} />
            <Text style={styles.metaText}>
              {formatTime(item.horaInicio)} - {formatTime(item.horaFin)}
            </Text>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${status.color}15`, borderColor: `${status.color}35` }]}>
              <MaterialCommunityIcons name={status.icon} size={14} color={status.color} />
              <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
            </View>

            <View style={styles.peopleBadge}>
              <MaterialCommunityIcons name="account-group-outline" size={14} color={COLORS.secondary} />
              <Text style={styles.peopleBadgeText}>
                {item.cantidadPersonas || item.personas} personas
              </Text>
            </View>
          </View>
        </View>

        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={COLORS.secondary}
          style={styles.toggleIcon}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID de Reserva:</Text>
            <Text style={[styles.detailValue, styles.monoText]}>
              {item._id?.substring(item._id.length - 8).toUpperCase() || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mesa asignada:</Text>
            <Text style={styles.detailValue}>
              {item.mesaID?.numero || item.mesaNumero || 'Mesa por asignar'}
            </Text>
          </View>

          {(item.mesaID?.ubicacion || item.mesaUbicacion) && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ubicación mesa:</Text>
              <Text style={styles.detailValue}>
                {item.mesaID?.ubicacion || item.mesaUbicacion}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de creación:</Text>
            <Text style={styles.detailValue}>
              {item.creadaEn ? new Date(item.creadaEn).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')}
            </Text>
          </View>

          {!!(item.notas || item.notes) && (
            <View style={styles.notesBlock}>
              <Text style={styles.notesTitle}>Notas adicionales:</Text>
              <Text style={styles.notesText}>{item.notas || item.notes}</Text>
            </View>
          )}

          {item.estado?.toUpperCase() === 'CANCELADA' && !!item.razonCancelacion && (
            <View style={styles.notesBlock}>
              <Text style={[styles.notesTitle, { color: COLORS.error }]}>Razón de cancelación:</Text>
              <Text style={styles.notesText}>{item.razonCancelacion}</Text>
            </View>
          )}

          {isCancellable && (
            <Button
              title="Cancelar Reservación"
              variant="secondary"
              onPress={() => onCancel(item._id)}
              style={styles.cancelBtn}
            />
          )}
        </View>
      )}
    </Card>
  );
};

export default ReservationItem;
