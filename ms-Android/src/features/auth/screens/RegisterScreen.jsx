import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { FloatingUtensilsBackground } from '../../../shared/components/FloatingUtensilsBackground';
import { useAuth } from '../hooks/useAuth';

import gastroFlowLogo from '../../../../assets/images/logo.png';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,255}$/;
const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const usernamePattern = /^[a-zA-Z0-9_-]+$/;
const phonePattern = /^[2-9]\d{7}$/;

const RegisterScreen = ({ navigation }) => {
  const { handleRegister, loading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const password = useWatch({ control, name: 'password' });

  const onSubmit = async (data) => {
    if (data.password !== data.passwordConfirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      await handleRegister(data);
      Alert.alert(
        'Registro exitoso',
        'Se te ha enviado un correo para verificar tu cuenta',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      const message = Array.isArray(backendErrors) && backendErrors.length > 0
        ? backendErrors.map((item) => item.message).join(' · ')
        : error.response?.data?.message || 'No fue posible crear la cuenta';
      Alert.alert('Error', message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FloatingUtensilsBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={gastroFlowLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>Únete a GastroFlow</Text>
        </View>

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
              required: 'El apellido es obligatorio',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 25, message: 'Máximo 25 caracteres' },
              pattern: { value: namePattern, message: 'Solo letras y espacios' },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Apellido"
                placeholder="Tu apellido"
                onChangeText={onChange}
                value={value}
                error={errors.surname?.message}
              />
            )}
            name="surname"
          />

          <Controller
            control={control}
            rules={{
              required: 'El usuario es obligatorio',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 50, message: 'Máximo 50 caracteres' },
              pattern: { value: usernamePattern, message: 'Letras, números, guiones y guion bajo' },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Usuario"
                placeholder="usuario123"
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                error={errors.username?.message}
              />
            )}
            name="username"
          />

          <Controller
            control={control}
            rules={{
              required: 'El email es obligatorio',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                placeholder="correo@ejemplo.com"
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
            name="email"
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

          <Controller
            control={control}
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              pattern: { value: passwordPattern, message: 'Debe incluir mayúscula, minúscula, número y carácter especial' },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Contraseña"
                placeholder="••••••••"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
            name="password"
          />

          <Controller
            control={control}
            rules={{
              required: 'Debes confirmar la contraseña',
              validate: (value) => value === password || 'Las contraseñas no coinciden',
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirmar contraseña"
                placeholder="••••••••"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                error={errors.passwordConfirm?.message}
              />
            )}
            name="passwordConfirm"
          />

          <Button
            title="Crear cuenta"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              Inicia sesión
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#26221a',
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  logo: {
    height: 60,
    width: 180,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  footerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  link: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;
