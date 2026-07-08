import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const UTENSILS = [
  { icon: 'chef-hat', top: '6%', left: '8%', size: 46, duration: 3200, delay: 0 },
  { icon: 'silverware-fork-knife', top: '14%', left: '78%', size: 34, duration: 2600, delay: 300 },
  { icon: 'pot-steam', top: '30%', left: '4%', size: 48, duration: 3600, delay: 600 },
  { icon: 'silverware-spoon', top: '38%', left: '84%', size: 32, duration: 2800, delay: 900 },
  { icon: 'knife', top: '52%', left: '16%', size: 34, duration: 3000, delay: 200 },
  { icon: 'cupcake', top: '60%', left: '80%', size: 38, duration: 3400, delay: 700 },
  { icon: 'stove', top: '74%', left: '10%', size: 42, duration: 3800, delay: 400 },
  { icon: 'bread-slice', top: '80%', left: '72%', size: 34, duration: 2900, delay: 100 },
  { icon: 'food-drumstick', top: '90%', left: '30%', size: 32, duration: 3100, delay: 500 },
];

const FloatingIcon = ({ icon, top, left, size, duration, delay }) => {
  const bob = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const spinLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(spin, {
          toValue: 1,
          duration: duration * 3,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(spin, {
          toValue: 0,
          duration: duration * 3,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    bobLoop.start();
    spinLoop.start();

    return () => {
      bobLoop.stop();
      spinLoop.stop();
    };
  }, [bob, spin, duration, delay]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '10deg'] });

  return (
    <Animated.View
      style={[styles.iconWrap, { top, left, transform: [{ translateY }, { rotate }] }]}
    >
      <MaterialCommunityIcons name={icon} size={size} color={COLORS.primary} style={styles.icon} />
    </Animated.View>
  );
};

export const FloatingUtensilsBackground = () => (
  <View style={styles.container} pointerEvents="none">
    {UTENSILS.map((item) => (
      <FloatingIcon key={item.icon} {...item} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  iconWrap: {
    position: 'absolute',
  },
  icon: {
    opacity: 0.4,
  },
});
