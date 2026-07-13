import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  list: {
    paddingBottom: SPACING.xl,
  },
  row: {
    gap: SPACING.sm,
  },
  cardWrapper: {
    flex: 1,
    marginBottom: SPACING.sm,
  },
  tableCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  tableCardOccupied: {
    opacity: 0.5,
  },
  tableCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tableNumber: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  tableCapacity: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    marginTop: 2,
  },
  tableTextSelected: {
    color: COLORS.background,
  },
  tableTextSelectedLight: {
    color: COLORS.background,
  },
  tableStatus: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    marginTop: SPACING.xs,
    textTransform: 'uppercase',
  },
  tableStatusFree: {
    color: COLORS.success,
  },
  tableStatusOccupied: {
    color: COLORS.error,
  },
});
