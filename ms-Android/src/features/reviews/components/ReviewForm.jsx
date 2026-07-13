import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

const ReviewForm = ({ visible, initialValues, onSubmit, onCancel, title = 'Escribir Reseña' }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialValues) {
      setRating(initialValues.rating || 0);
      setComment(initialValues.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
    setError(null);
  }, [initialValues, visible]);

  const handleSelectRating = (selectedRating) => {
    setRating(selectedRating);
    setError(null);
  };

  const handleTextChange = (text) => {
    if (text.length <= 500) {
      setComment(text);
      setError(null);
    }
  };

  const handleSave = () => {
    if (rating === 0) {
      setError('Por favor selecciona una calificación de 1 a 5 estrellas.');
      return;
    }
    if (comment.length > 500) {
      setError('El comentario no puede exceder los 500 caracteres.');
      return;
    }
    onSubmit({ rating, comment });
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleSelectRating(i)}
          style={styles.starTouch}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={i <= rating ? 'star' : 'star-outline'}
            size={36}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.label}>Calificación:</Text>
            {renderStars()}

            <View style={styles.commentContainer}>
              <Input
                label="Comentario (opcional):"
                value={comment}
                onChangeText={handleTextChange}
                placeholder="Escribe tu opinión sobre el restaurante o la comida..."
                multiline
                numberOfLines={6}
                style={styles.textArea}
              />
              <Text style={[styles.charCounter, comment.length >= 480 && styles.charWarning]}>
                {comment.length}/500
              </Text>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancelar"
              onPress={onCancel}
              variant="outline"
              style={styles.footerButton}
            />
            <Button
              title="Guardar"
              onPress={handleSave}
              variant="primary"
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    paddingBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  starTouch: {
    padding: 4,
  },
  commentContainer: {
    position: 'relative',
    marginTop: SPACING.sm,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCounter: {
    position: 'absolute',
    bottom: -18,
    right: 4,
    fontSize: FONT_SIZE.xs - 2,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  charWarning: {
    color: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  footerButton: {
    flex: 1,
  },
});

export default ReviewForm;
