import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { FloatingUtensilsBackground } from './FloatingUtensilsBackground';

const ScreenBackground = ({ children, style }) => (
  <View style={[styles.container, style]}>
    <FloatingUtensilsBackground />
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screenBackground,
  },
});

export default ScreenBackground;
