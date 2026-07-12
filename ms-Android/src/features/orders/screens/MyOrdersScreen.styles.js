import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    flexGrow: 0,
  },
  filterScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  filterTabTextActive: {
    color: COLORS.background,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  orderNumber: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    fontWeight: '700',
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  itemChip: {
    backgroundColor: `${COLORS.border}30`,
    borderWidth: 1,
    borderColor: `${COLORS.border}70`,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  itemChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  trackBtn: {
    marginTop: SPACING.xs,
  },
});
