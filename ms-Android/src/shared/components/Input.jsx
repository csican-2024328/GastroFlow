import { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';

const Input = ({ label, error, isPassword, secureTextEntry, style, ...props }) => {
  const [visible, setVisible] = useState(false);
  const hideText = isPassword ? !visible : secureTextEntry;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, isPassword && styles.inputWithIcon, error && styles.inputError, style]}
          placeholderTextColor={COLORS.secondary}
          secureTextEntry={hideText}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setVisible((current) => !current)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name={visible ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputWrap: {
    justifyContent: 'center',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  inputWithIcon: {
    paddingRight: SPACING.xl,
  },
  eyeButton: {
    position: 'absolute',
    right: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
});

export default Input;
