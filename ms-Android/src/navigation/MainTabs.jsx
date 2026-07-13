import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../shared/constants/theme';

import RestaurantsListScreen from '../features/restaurants/screens/RestaurantsListScreen';
import RestaurantDetailScreen from '../features/restaurants/screens/RestaurantDetailScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import ReservationsScreen from '../features/reservations/screens/ReservationsScreen';
import NewReservationScreen from '../features/reservations/screens/NewReservationScreen';
import MyOrdersScreen from '../features/orders/screens/MyOrdersScreen';
import OrderTrackingScreen from '../features/orders/screens/OrderTrackingScreen';
import MakeOrderScreen from '../features/orders/screens/MakeOrderScreen';
import SelectTableScreen from '../features/orders/screens/SelectTableScreen';
import PaymentScreen from '../features/orders/screens/PaymentScreen';
import OrderTypeScreen from '../features/orders/screens/OrderTypeScreen';
import CheckoutDetailsScreen from '../features/orders/screens/CheckoutDetailsScreen';
import RestaurantListScreen from '../features/orders/screens/RestaurantListScreen';
import OrderSuccessScreen from '../features/orders/screens/OrderSuccessScreen';
import GlobalMenuScreen from '../features/catalog/screens/GlobalMenuScreen';
import CouponsScreen from '../features/coupons/screens/CouponsScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const RestaurantsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.surface },
      headerTintColor: COLORS.text,
      headerTitleStyle: { color: COLORS.text },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="RestaurantsList"
      component={RestaurantsListScreen}
      options={{ title: 'Restaurantes' }}
    />
    <Stack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
      options={{ title: 'Restaurante' }}
    />
  </Stack.Navigator>
);

const ReservationsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.surface },
      headerTintColor: COLORS.text,
      headerTitleStyle: { color: COLORS.text },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="ReservationsList"
      component={ReservationsScreen}
      options={{ title: 'Mis Reservaciones' }}
    />
    <Stack.Screen
      name="NewReservation"
      component={NewReservationScreen}
      options={{ title: 'Nueva Reservación' }}
    />
  </Stack.Navigator>
);

const RootStack = createNativeStackNavigator();

const MainBottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Restaurants') iconName = 'restaurant';
          else if (route.name === 'Reservations') iconName = 'event-available';
          else if (route.name === 'Profile') iconName = 'person';

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Restaurants" component={RestaurantsStack} options={{ title: 'Restaurantes' }} />
      <Tab.Screen name="Reservations" component={ReservationsStack} options={{ title: 'Reservaciones' }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          headerTitleStyle: { color: COLORS.text },
          headerShadowVisible: false,
        }}
      />
    </Tab.Navigator>
  );
};

const MainTabs = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { color: COLORS.text },
        headerShadowVisible: false,
      }}
    >
      <RootStack.Screen
        name="MainBottomTabs"
        component={MainBottomTabs}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{ title: 'Mis Pedidos' }}
      />
      <RootStack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{ title: 'Seguimiento de Pedido' }}
      />
      <RootStack.Screen
        name="MakeOrder"
        component={MakeOrderScreen}
        options={{ title: 'Hacer Pedido' }}
      />
      <RootStack.Screen
        name="SelectTable"
        component={SelectTableScreen}
        options={{ title: 'Seleccionar Mesa' }}
      />
      <RootStack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Método de Pago' }}
      />
      <RootStack.Screen
        name="RestaurantList"
        component={RestaurantListScreen}
        options={{ title: 'Restaurantes' }}
      />
      <RootStack.Screen
        name="GlobalMenu"
        component={GlobalMenuScreen}
        options={{ title: 'Catálogo' }}
      />
      <RootStack.Screen
        name="OrderType"
        component={OrderTypeScreen}
        options={{ title: 'Tipo de Pedido' }}
      />
      <RootStack.Screen
        name="CheckoutDetails"
        component={CheckoutDetailsScreen}
        options={{ title: 'Detalles del Pedido' }}
      />
      <RootStack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ title: 'Pedido Exitoso' }}
      />
      <RootStack.Screen
        name="Coupons"
        component={CouponsScreen}
        options={{ title: 'Cupones' }}
      />
    </RootStack.Navigator>
  );
};

export default MainTabs;
