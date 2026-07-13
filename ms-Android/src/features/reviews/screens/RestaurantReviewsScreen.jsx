import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { LoadingSpinner, EmptyState } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import Button from '../../../shared/components/Button';
import ReviewItem from '../components/ReviewItem';
import ReviewForm from '../components/ReviewForm';
import { useReviews } from '../hooks/useReviews';
import { useAuthStore } from '../../../shared/store/authStore';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';

const RestaurantReviewsScreen = ({ route }) => {
  const { restaurantId, restaurantName } = route.params || {};
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id || user?._id || user?.sub;

  const { reviews, loading, error, fetchReviews, addReview, editReview, removeReview } = useReviews();
  const { alertProps, showAlert } = useAppAlert();

  const [formVisible, setFormVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const loadData = () => {
    if (restaurantId) {
      fetchReviews({ restaurantID: restaurantId });
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const handleSubmit = async (values) => {
    setFormVisible(false);
    if (editingReview) {
      const res = await editReview(editingReview._id, values);
      if (res.success) {
        showAlert('success', 'Éxito', res.message);
        loadData(); // Reload populate data
      } else {
        showAlert('error', 'Error', res.error);
      }
    } else {
      const res = await addReview({
        restaurantID: restaurantId,
        rating: values.rating,
        comment: values.comment,
      });
      if (res.success) {
        showAlert('success', 'Éxito', res.message);
        loadData(); // Reload populate data
      } else {
        showAlert('error', 'Error', res.error);
      }
    }
    setEditingReview(null);
  };

  const handleEditPress = (item) => {
    setEditingReview(item);
    setFormVisible(true);
  };

  const handleDeletePress = async (id) => {
    const res = await removeReview(id);
    if (res.success) {
      showAlert('success', 'Éxito', res.message);
    } else {
      showAlert('error', 'Error', res.error);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>Reseñas de {restaurantName || 'Restaurante'}</Text>
          <Text style={styles.subtitle}>Conoce la opinión de otros clientes de GastroFlow</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Escribir Reseña"
            onPress={() => {
              setEditingReview(null);
              setFormVisible(true);
            }}
            variant="primary"
          />
        </View>

        {loading && !reviews.length ? (
          <LoadingSpinner />
        ) : error && !reviews.length ? (
          <EmptyState message={error} />
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ReviewItem
                item={item}
                currentUserId={currentUserId}
                onEdit={() => handleEditPress(item)}
                onDelete={() => handleDeletePress(item._id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadData} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={<EmptyState message="Nadie ha opinado sobre este restaurante aún. ¡Sé el primero!" />}
          />
        )}

        <ReviewForm
          visible={formVisible}
          initialValues={editingReview}
          title={editingReview ? 'Editar Reseña' : 'Escribir Reseña'}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormVisible(false);
            setEditingReview(null);
          }}
        />
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
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.lg + 2,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginTop: 2,
  },
  buttonContainer: {
    marginVertical: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});

export default RestaurantReviewsScreen;
