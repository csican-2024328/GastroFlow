import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import Button from '../../../shared/components/Button';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { FloatingUtensilsBackground } from '../../../shared/components/FloatingUtensilsBackground';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { useAuthStore } from '../../../shared/store/authStore';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const { alertProps, showConfirm } = useAppAlert();

  const handleLogout = () => {
    showConfirm('Cerrar sesión', '¿Estás seguro que deseas salir?', () => logout());
  };

  return (
    <View style={styles.container}>
      <FloatingUtensilsBackground />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userHandle}>{user?.email}</Text>
        </View>

        <View style={styles.content}>
          <Button title="Cerrar sesión" variant="secondary" onPress={handleLogout} />
          <Text style={styles.version}>GastroFlow v1.0.0</Text>
        </View>
      </ScrollView>
      <AppAlertModal {...alertProps} confirmText="Aceptar" cancelText="Cancelar" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#26221a',
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
