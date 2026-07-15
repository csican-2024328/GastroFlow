import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import Button from '../../../shared/components/Button';
import { COLORS } from '../../../shared/constants/theme';
import styles from './OrderSuccessScreen.styles';

const OrderSuccessScreen = ({ route, navigation }) => {
  const { orderId, numeroOrden } = route.params || {};

  const goToMyOrders = () => {
    navigation.reset({ index: 1, routes: [{ name: 'MainBottomTabs' }, { name: 'MyOrders' }] });
  };

  const goHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainBottomTabs' }] });
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="check-circle" size={56} color={COLORS.success} />
        </View>

        <Text style={styles.title}>¡Pedido Exitoso!</Text>
        <Text style={styles.message}>Tu pedido fue registrado y ya está en preparación.</Text>
        {!!numeroOrden && <Text style={styles.orderNumber}>Orden #{numeroOrden}</Text>}

        <View style={styles.buttonRow}>
          {!!orderId && (
            <Button
              title="Ver seguimiento"
              onPress={() => navigation.navigate('OrderTracking', { orderId })}
              variant="secondary"
            />
          )}
          <Button title="Ver mis pedidos" onPress={goToMyOrders} variant="secondary" />
          <Button title="Volver al inicio" onPress={goHome} />
        </View>
      </View>
    </ScreenBackground>
  );
};

export default OrderSuccessScreen;
