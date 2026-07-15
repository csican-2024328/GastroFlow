import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { LoadingSpinner, EmptyState } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import EventCard from '../components/EventCard';
import { useEvents } from '../hooks/useEvents';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';

const EventsScreen = ({ route, navigation }) => {
  const { restaurantId, fromCheckout } = route.params || {};
  const { events, loading, error, fetchEvents, validateAndApplyEvent } = useEvents();
  const { alertProps, showAlert } = useAppAlert();

  useEffect(() => {
    fetchEvents(restaurantId);
  }, [restaurantId, fetchEvents]);

  const handleApplyEvent = async (eventId) => {
    const result = await validateAndApplyEvent(eventId);
    if (result.success) {
      showAlert('success', 'Promoción Aplicada', result.message);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } else {
      showAlert('error', 'Error al aplicar', result.error);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ofertas y Promociones</Text>
          <Text style={styles.subtitle}>
            {fromCheckout 
              ? 'Aplica una promoción a tu pedido actual' 
              : 'Descubre las ofertas y eventos especiales disponibles'}
          </Text>
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <EventCard
                item={item}
                fromCheckout={fromCheckout}
                onApply={() => handleApplyEvent(item._id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState message={restaurantId ? "No hay promociones vigentes para este restaurante." : "No hay promociones vigentes en este momento."} />
            }
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
});

export default EventsScreen;
