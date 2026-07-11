import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../shared/constants/theme';

import RestaurantsListScreen from '../features/restaurants/screens/RestaurantsListScreen';
import RestaurantDetailScreen from '../features/restaurants/screens/RestaurantDetailScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';

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

const MainTabs = () => {
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
          else if (route.name === 'Profile') iconName = 'person';

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Restaurants" component={RestaurantsStack} options={{ title: 'Restaurantes' }} />
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

export default MainTabs;
