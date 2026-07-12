import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../../shared/constants/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: 80, // Espacio para el FAB
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});
