import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { Card } from '../../../shared/components/Common';

const ReviewItem = ({ item, currentUserId, onEdit, onDelete }) => {
  const isOwnReview = item.userID && currentUserId && (item.userID === currentUserId || item.userID._id === currentUserId || item.userID.toString() === currentUserId.toString());
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={18}
          color={COLORS.primary}
        />
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.authorText}>
            {item.restaurantID?.name ? `Restaurante: ${item.restaurantID.name}` : 'Usuario GastroFlow'}
          </Text>
          {item.platoID?.nombre ? (
            <Text style={styles.platoText}>Plato: {item.platoID.nombre}</Text>
          ) : null}
        </View>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>

      <View style={styles.ratingContainer}>
        {renderStars(item.rating)}
        <Text style={styles.ratingNumber}>({item.rating}/5)</Text>
      </View>

      {item.comment ? (
        <Text style={styles.commentText}>{item.comment}</Text>
      ) : (
        <Text style={[styles.commentText, styles.noComment]}>Sin comentario escrito.</Text>
      )}

      {isOwnReview && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={onEdit} style={[styles.actionButton, styles.editButton]} activeOpacity={0.7}>
            <MaterialCommunityIcons name="pencil" size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={[styles.actionButton, styles.deleteButton]} activeOpacity={0.7}>
            <MaterialCommunityIcons name="trash-can" size={16} color={COLORS.error} />
            <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    borderRadius: 14,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  authorText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.text,
  },
  platoText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  starsRow: {
    flexDirection: 'row',
  },
  ratingNumber: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  commentText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
  noComment: {
    fontStyle: 'italic',
    color: COLORS.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: `${COLORS.primary}10`,
  },
  deleteButton: {
    backgroundColor: `${COLORS.error}10`,
  },
  actionText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteText: {
    color: COLORS.error,
  },
});

export default ReviewItem;
