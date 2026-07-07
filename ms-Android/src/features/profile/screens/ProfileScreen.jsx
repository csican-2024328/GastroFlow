import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import Button from '../../../shared/components/Button';
import { useAuthStore } from '../../../shared/store/authStore';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aceptar', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.userHandle}>{user?.email}</Text>
      </View>

      <View style={styles.content}>
        <Button title="Cerrar sesión" variant="secondary" onPress={handleLogout} />
        <Text style={styles.version}>GastroFlow v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  userHandle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  version: {
    textAlign: 'center',
    marginTop: SPACING.xxl,
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
});

export default ProfileScreen;
