import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  backBtnInline: {
    width: '80%',
  },
  tablesScroll: {
    paddingBottom: SPACING.xl,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tableCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tableCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tableNum: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  tableCap: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    marginTop: 2,
  },
  tableUbi: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 4,
    fontWeight: '600',
  },
  tableTextSelected: {
    color: COLORS.background,
  },
  tableTextSelectedLight: {
    color: `${COLORS.background}CC`,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  halfBtn: {
    flex: 1,
  },
});
