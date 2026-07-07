import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { FloatingUtensilsBackground } from '../../../shared/components/FloatingUtensilsBackground';
import { useAuth } from '../hooks/useAuth';

import gastroFlowLogo from '../../../../assets/images/logo.png';

const LoginScreen = ({ navigation }) => {
  const { handleLogin, loading } = useAuth();

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
      const message = error.response?.data?.message || 'Error al iniciar sesión';
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
