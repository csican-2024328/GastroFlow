import { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/theme';
import styles from './ReservationsScreen.styles';
import { EmptyState, LoadingSpinner } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { useReservations } from '../hooks/useReservations';
import StatusFilterBar from '../components/StatusFilterBar';
import ReservationItem from '../components/ReservationItem';

// Habilitar animaciones de diseño en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ReservationsScreen = ({ navigation }) => {
  const { reservations, loading, fetchMyReservations, cancelReservation } = useReservations();
  const { alertProps, showAlert, showConfirm } = useAppAlert();
  
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const loadReservations = useCallback(() => {
    fetchMyReservations().catch((err) => {
      showAlert('error', 'Error', err.message || 'No se pudieron cargar tus reservaciones.');
    });
  }, [fetchMyReservations, showAlert]);

  useEffect(() => {
    loadReservations();
  }, []);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCancelPress = (id) => {
    showConfirm(
      'Cancelar Reservación',
      '¿Estás seguro que deseas cancelar esta reservación? Esta acción no se puede deshacer.',
      async () => {
        try {
          await cancelReservation(id, 'Cancelado por el cliente desde el dispositivo móvil.');
          showAlert('success', 'Reservación Cancelada', 'Tu reservación ha sido cancelada correctamente.');
        } catch (err) {
          showAlert('error', 'Error al cancelar', err.message || 'No se pudo cancelar la reservación.');
        }
      }
    );
  };

  // Filtrado de reservaciones en local
  const filteredReservations = reservations.filter((r) => {
    if (filter === 'all') return true;
    return r.estado?.toUpperCase() === filter.toUpperCase();
  });

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <StatusFilterBar selectedFilter={filter} onSelectFilter={setFilter} />

        {loading && reservations.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={filteredReservations}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ReservationItem
                item={item}
                isExpanded={expandedId === item._id}
                onToggle={() => toggleExpand(item._id)}
                onCancel={handleCancelPress}
              />
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadReservations}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                message={
                  filter === 'all'
                    ? 'Aún no tienes reservaciones registradas.'
                    : 'No tienes reservaciones con ese estado.'
                }
              />
            }
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Restaurants')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.background} />
        </TouchableOpacity>
      </View>
      <AppAlertModal {...alertProps} />
    </ScreenBackground>
  );
};

export default ReservationsScreen;
