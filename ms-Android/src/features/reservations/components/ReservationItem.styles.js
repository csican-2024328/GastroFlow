import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

export default StyleSheet.create({
  card: {
    marginVertical: 6,
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  peopleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: `${COLORS.border}50`,
  },
  peopleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  toggleIcon: {
    marginLeft: SPACING.md,
  },
  expandedContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    fontWeight: '700',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  notesBlock: {
    backgroundColor: `${COLORS.border}30`,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  notesText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  cancelBtn: {
    marginTop: SPACING.md,
    borderColor: COLORS.error,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
});
