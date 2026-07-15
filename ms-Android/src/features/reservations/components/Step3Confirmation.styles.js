import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

export default StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  summaryCard: {
    padding: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.secondary,
    width: 80,
  },
  summaryVal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  summaryNotesBlock: {
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  summaryNotesTitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryNotesText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.warning}15`,
    borderWidth: 1,
    borderColor: `${COLORS.warning}40`,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  disclaimerTextContainer: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.warning,
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
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
