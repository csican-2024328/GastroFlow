import { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 320);

const SideDrawer = ({ visible, onClose, user, items = [] }) => {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      translateX.setValue(-DRAWER_WIDTH);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={28} color={COLORS.background} />
            </View>
            <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Invitado'}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
          </View>

          <View style={styles.list}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.item}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={item.active ? COLORS.primary : COLORS.textLight}
                />
                <Text style={[styles.itemLabel, item.active && styles.itemLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 10, 8, 0.75)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingTop: SPACING.xxl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: SPACING.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 10,
  },
  itemLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  itemLabelActive: {
    color: COLORS.primary,
  },
});

export default SideDrawer;
