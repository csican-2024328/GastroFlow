import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  itemCard: {
    flexDirection: 'row',
    padding: SPACING.sm,
  },
  itemCardDisabled: {
    opacity: 0.5,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  itemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePlato: {
    backgroundColor: `${COLORS.border}60`,
  },
  badgeMenu: {
    backgroundColor: `${COLORS.primary}25`,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextPlato: {
    color: COLORS.textLight,
  },
  badgeTextMenu: {
    color: COLORS.primary,
  },
  itemDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    marginTop: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.primary,
  },
  unavailableText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.error,
  },
  checkingText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  restaurantName: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    marginTop: 2,
  },
  cartBar: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: SPACING.md,
  },
});
