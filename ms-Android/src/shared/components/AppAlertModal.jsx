import { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';

const VARIANTS = {
  success: { icon: 'check-circle', color: COLORS.success },
  error: { icon: 'close-circle', color: COLORS.error },
  info: { icon: 'information', color: COLORS.primary },
  confirm: { icon: 'help-circle', color: COLORS.primary },
};

const AppAlertModal = ({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'Entendido',
  cancelText = 'Cancelar',
  showCancel = false,
  onConfirm,
  onCancel,
}) => {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const variant = VARIANTS[type] || VARIANTS.info;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.85);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 80 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={showCancel ? onCancel : onConfirm}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${variant.color}22`, borderColor: `${variant.color}55` }]}>
            <MaterialCommunityIcons name={variant.icon} size={42} color={variant.color} />
          </View>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!message && <Text style={styles.message}>{message}</Text>}
          {showCancel ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonFlex, styles.buttonOutline]}
                onPress={onCancel}
                activeOpacity={0.85}
              >
                <Text style={[styles.buttonText, styles.buttonTextOutline]}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonFlex, { backgroundColor: variant.color }]}
                onPress={onConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonSingle, { backgroundColor: variant.color }]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 10, 8, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  button: {
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonSingle: {
    width: '100%',
  },
  buttonFlex: {
    flex: 1,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  buttonTextOutline: {
    color: COLORS.textLight,
  },
});

export default AppAlertModal;
