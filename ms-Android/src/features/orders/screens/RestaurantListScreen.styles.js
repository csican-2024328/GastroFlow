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
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  category: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    marginTop: 2,
  },
  address: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    marginTop: 2,
  },
});
