import { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/Common';
import { COLORS } from '../../../shared/constants/theme';
import { useAvailableTables } from '../hooks/useAvailableTables';
import { useOrderCart } from '../hooks/useOrderCart';
import styles from './SelectTableScreen.styles';

const SelectTableScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params || {};
  const { tables, loading, fetchTables } = useAvailableTables();
  const { selectedTable, setSelectedTable } = useOrderCart();

  useEffect(() => {
    if (restaurantId) fetchTables(restaurantId);
  }, [restaurantId, fetchTables]);

  const handleSelect = useCallback(
    (table) => {
      if (table.isOccupied) return;
      setSelectedTable(table);
      navigation.goBack();
    },
    [setSelectedTable, navigation],
  );

  if (loading && tables.length === 0) {
    return (
      <ScreenBackground>
        <LoadingSpinner />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Selecciona una mesa</Text>
        <Text style={styles.subtitle}>
          Nota: la disponibilidad en tiempo real aún no está conectada; todas las mesas se muestran
          libres hasta que el backend exponga ese dato al rol Cliente.
        </Text>

        {tables.length === 0 ? (
          <EmptyState message="No hay mesas registradas para este restaurante." />
        ) : (
          <FlatList
            data={tables}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSelected = selectedTable?._id === item._id;
              return (
                <TouchableOpacity
                  activeOpacity={item.isOccupied ? 1 : 0.8}
                  disabled={item.isOccupied}
                  onPress={() => handleSelect(item)}
                  style={styles.cardWrapper}
                >
                  <Card
                    style={[
                      styles.tableCard,
                      item.isOccupied && styles.tableCardOccupied,
                      isSelected && styles.tableCardSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.isOccupied ? 'table-furniture' : 'table-chair'}
                      size={28}
                      color={item.isOccupied ? COLORS.secondary : isSelected ? COLORS.background : COLORS.primary}
                    />
                    <Text style={[styles.tableNumber, isSelected && styles.tableTextSelected]}>
                      Mesa {item.numero}
                    </Text>
                    <Text style={[styles.tableCapacity, isSelected && styles.tableTextSelectedLight]}>
                      {item.capacidad} personas
                    </Text>
                    <Text
                      style={[
                        styles.tableStatus,
                        item.isOccupied ? styles.tableStatusOccupied : styles.tableStatusFree,
                      ]}
                    >
                      {item.isOccupied ? 'Ocupada' : 'Libre'}
                    </Text>
                  </Card>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </ScreenBackground>
  );
};

export default SelectTableScreen;
