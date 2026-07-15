import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';
import { useAuth } from '../hooks/useAuth';

import gastroFlowLogo from '../../../../assets/images/logo.png';

const LoginScreen = ({ navigation }) => {
  const { handleLogin, loading } = useAuth();
  const { alertProps, showAlert } = useAppAlert();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await handleLogin(data);
    } catch (error) {
      showAlert('error', 'No se pudo iniciar sesión', getErrorMessage(error, 'Error al iniciar sesión'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image source={gastroFlowLogo} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              rules={{ required: 'Correo o usuario requerido' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Correo o usuario"
                  placeholder="chef@gastroflow.com"
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  error={errors.emailOrUsername?.message}
                />
              )}
              name="emailOrUsername"
            />

            <Controller
              control={control}
              rules={{ required: 'Contraseña requerida' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Contraseña"
                  placeholder="••••••••"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  error={errors.password?.message}
                />
              )}
              name="password"
            />

            <Button
              title="Ingresar al sistema"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Crear cuenta?</Text>
              <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
                Solicitar acceso
              </Text>
            </View>
          </View>
        </ScrollView>
        <AppAlertModal {...alertProps} />
      </ScreenBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    height: 200,
    width: 400,
    marginBottom: SPACING.sm,
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
    gap: SPACING.xs,
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

export default LoginScreen;
