import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { LoadingSpinner, EmptyState } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import ReviewItem from '../components/ReviewItem';
import ReviewForm from '../components/ReviewForm';
import { useReviews } from '../hooks/useReviews';
import { useAuthStore } from '../../../shared/store/authStore';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';

const MyReviewsScreen = () => {
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id || user?._id || user?.sub;

  const { reviews, loading, error, fetchReviews, editReview, removeReview } = useReviews();
  const { alertProps, showAlert } = useAppAlert();

  const [formVisible, setFormVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const loadData = () => {
    if (currentUserId) {
      fetchReviews({ userID: currentUserId });
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const handleSubmit = async (values) => {
    setFormVisible(false);
    if (editingReview) {
      const res = await editReview(editingReview._id, values);
      if (res.success) {
        showAlert('success', 'Éxito', res.message);
        loadData(); // Reload to populate references properly
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
          <Text style={styles.title}>Mis Reseñas</Text>
          <Text style={styles.subtitle}>Historial de tus opiniones escritas en GastroFlow</Text>
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
            ListEmptyComponent={<EmptyState message="No has publicado ninguna reseña todavía." />}
          />
        )}

        <ReviewForm
          visible={formVisible}
          initialValues={editingReview}
          title="Editar Reseña"
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

export default MyReviewsScreen;
