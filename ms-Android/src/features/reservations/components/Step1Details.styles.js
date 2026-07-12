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
  dateSelector: {
    paddingBottom: SPACING.xs,
  },
  dateCard: {
    width: 65,
    height: 90,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  dateNum: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 2,
  },
  dateDay: {
    fontSize: 10,
    color: COLORS.secondary,
  },
  textActive: {
    color: COLORS.background,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  timeButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    width: '23%',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeButtonTextActive: {
    color: COLORS.background,
  },
  partyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    marginVertical: 0,
  },
  partyBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partyValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  nextBtn: {
    marginTop: SPACING.md,
  },
});
