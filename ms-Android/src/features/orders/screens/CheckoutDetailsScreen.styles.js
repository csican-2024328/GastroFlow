import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

export default StyleSheet.create({
  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  sectionValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  couponInput: {
    flex: 1,
  },
  couponButton: {
    width: 110,
  },
  summaryCard: {
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  summaryDiscount: {
    color: COLORS.error,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.primary,
  },
  confirmButton: {
    marginTop: SPACING.sm,
  },
});
