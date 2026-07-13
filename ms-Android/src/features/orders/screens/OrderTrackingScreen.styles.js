import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  trackingCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusLabelText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  restaurantInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoKey: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.secondary,
    width: 90,
  },
  infoValue: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  stepCircleDone: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  stepCircleTextActive: {
    color: COLORS.background,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 6,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  stepLabelDone: {
    color: COLORS.success,
  },
  stepLine: {
    position: 'absolute',
    top: 15,
    left: '50%',
    width: '100%',
    height: 3,
    backgroundColor: COLORS.border,
    zIndex: 1,
  },
  stepLineFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  itemsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${COLORS.border}20`,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  itemMain: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemMeta: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
  },
  totalValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  grandTotalLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.text,
  },
  grandTotalValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actionCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  paidBadge: {
    backgroundColor: `${COLORS.success}15`,
    borderColor: `${COLORS.success}35`,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  paidBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.success,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },
});
