import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Common';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { useAuthStore } from '../../../shared/store/authStore';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';
import { useProfile } from '../hooks/useProfile';

const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const phonePattern = /^[2-9]\d{7}$/;

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const { loading, savingProfile, uploadingAvatar, getProfile, updateProfile, updateAvatar } = useProfile();
  const { alertProps, showAlert, showConfirm } = useAppAlert();
  const { width } = useWindowDimensions();
  const [editMode, setEditMode] = useState(false);

  const avatarSize = Math.min(width * 0.28, 110);
  const avatarUri = user?.profileImage || user?.profilePicture;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  useEffect(() => {
    getProfile().catch((error) => {
      showAlert('error', 'No se pudo cargar tu perfil', getErrorMessage(error, 'Intenta de nuevo más tarde'));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = () => {
    reset({ name: user?.name || '', phone: user?.phone || '' });
    setEditMode(true);
  };

  const cancelEdit = () => {
    reset({ name: user?.name || '', phone: user?.phone || '' });
    setEditMode(false);
  };

  const onSubmit = async (formValues) => {
    try {
      await updateProfile(formValues);
      showAlert('success', 'Perfil actualizado', 'Tus datos se guardaron correctamente.');
      setEditMode(false);
    } catch (error) {
      showAlert('error', 'No se pudo guardar', getErrorMessage(error, 'No fue posible actualizar tu perfil'));
    }
  };

  const pickImage = async (source) => {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showAlert('error', 'Permiso requerido', 'Activa el permiso de cámara para tomar una foto.');
          return;
        }
      }

      const pickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets?.length) return;

      await updateAvatar(result.assets[0]);
      showAlert('success', 'Foto actualizada', 'Tu foto de perfil se actualizó correctamente.');
    } catch (error) {
      showAlert('error', 'No se pudo actualizar la foto', getErrorMessage(error, 'No fue posible actualizar la foto de perfil'));
    }
  };

  const handleChangePhoto = () => {
    Alert.alert('Cambiar foto de perfil', 'Elige una opción', [
      { text: 'Tomar foto', onPress: () => pickImage('camera') },
      { text: 'Elegir de galería', onPress: () => pickImage('gallery') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleLogout = () => {
    showConfirm('Cerrar sesión', '¿Estás seguro que deseas salir?', () => logout());
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={[styles.avatarWrap, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={avatarSize} color={COLORS.textLight} />
              )}
              {uploadingAvatar && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color={COLORS.text} />
                </View>
              )}
              {editMode && !uploadingAvatar && (
                <TouchableOpacity style={styles.cameraBadge} onPress={handleChangePhoto} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="camera" size={18} color={COLORS.background} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Usuario'} {user?.surname || ''}
            </Text>
            {!!user?.role && (
              <View style={styles.roleBadge}>
                <MaterialCommunityIcons name="shield-check-outline" size={12} color={COLORS.primary} />
                <Text style={styles.roleBadgeText}>{user.role}</Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            {!editMode ? (
              <>
                <Card style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Usuario</Text>
                    <Text style={styles.infoValue}>{user?.username || '-'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email || '-'}</Text>
                  </View>
                  <View style={[styles.infoRow, styles.infoRowLast]}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoValue}>{user?.phone || 'Sin teléfono registrado'}</Text>
                  </View>
                </Card>

                {loading && !user ? (
                  <ActivityIndicator color={COLORS.primary} style={styles.loadingIndicator} />
                ) : (
                  <Button title="Editar perfil" onPress={startEdit} style={styles.actionButton} />
                )}
                <Button title="Cerrar sesión" variant="secondary" onPress={handleLogout} style={styles.actionButton} />
              </>
            ) : (
              <View style={styles.form}>
                <Controller
                  control={control}
                  rules={{
                    required: 'El nombre es obligatorio',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                    maxLength: { value: 25, message: 'Máximo 25 caracteres' },
                    pattern: { value: namePattern, message: 'Solo letras y espacios' },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Nombre"
                      placeholder="Tu nombre"
                      onChangeText={onChange}
                      value={value}
                      error={errors.name?.message}
                    />
                  )}
                  name="name"
                />

                <Controller
                  control={control}
                  rules={{
                    required: 'El teléfono es obligatorio',
                    pattern: { value: phonePattern, message: '8 dígitos, debe comenzar entre 2 y 9' },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Teléfono"
                      placeholder="22345678"
                      keyboardType="numeric"
                      onChangeText={onChange}
                      value={value}
                      error={errors.phone?.message}
                    />
                  )}
                  name="phone"
                />

                <Button
                  title="Guardar cambios"
                  onPress={handleSubmit(onSubmit)}
                  loading={savingProfile}
                  style={styles.actionButton}
                />
                <Button title="Cancelar" variant="secondary" onPress={cancelEdit} style={styles.actionButton} />
              </View>
            )}

            <Text style={styles.version}>GastroFlow v1.0.0</Text>
          </View>
        </ScrollView>
        <AppAlertModal {...alertProps} confirmText="Aceptar" cancelText="Cancelar" />
      </ScreenBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
    overflow: 'visible',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    backgroundColor: 'rgba(11, 10, 8, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  userName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    maxWidth: '100%',
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: `${COLORS.primary}1a`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}55`,
  },
  roleBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  content: {
    padding: SPACING.lg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  infoCard: {
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: SPACING.md,
  },
  form: {
    width: '100%',
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  loadingIndicator: {
    marginBottom: SPACING.sm,
  },
  version: {
    textAlign: 'center',
    marginTop: SPACING.xl,
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
});

export default ProfileScreen;
