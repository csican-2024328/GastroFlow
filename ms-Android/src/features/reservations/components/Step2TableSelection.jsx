import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/theme';
import Button from '../../../shared/components/Button';
import { LoadingSpinner } from '../../../shared/components/Common';
import styles from './Step2TableSelection.styles';

const Step2TableSelection = ({
  tables,
  partySize,
  selectedDate,
  startTime,
  endTime,
  selectedTable,
  setSelectedTable,
  loading,
  onNext,
  onBack,
}) => {
  
  // Filtrar mesas según la cantidad de personas
  const filteredTables = useMemo(() => {
    return (tables || []).filter(
      (t) => (t.capacidad || t.capacity) >= Number(partySize)
    );
  }, [tables, partySize]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Selecciona una Mesa Disponible</Text>
      <Text style={styles.subtitle}>
        Para {partySize} personas el {selectedDate} de {startTime} a {endTime}
      </Text>

      {filteredTables.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="emoticon-sad-outline" size={48} color={COLORS.secondary} />
          <Text style={styles.emptyTitle}>No hay mesas disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Prueba cambiando el horario o la cantidad de asistentes en el paso anterior.
          </Text>
          <Button
            title="← Cambiar Fecha/Hora"
            variant="secondary"
            onPress={onBack}
            style={styles.backBtnInline}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.tablesScroll}>
          <View style={styles.tableGrid}>
            {filteredTables.map((table) => {
              const cap = table.capacidad || table.capacity;
              const isSelected = selectedTable?._id === table._id;
              const iconName = cap <= 2 ? 'chair-rolling' : cap <= 4 ? 'table-chair' : 'table-large';

              return (
                <TouchableOpacity
                  key={table._id}
                  style={[styles.tableCard, isSelected && styles.tableCardSelected]}
                  onPress={() => setSelectedTable(table)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={iconName}
                    size={32}
                    color={isSelected ? COLORS.background : COLORS.primary}
                  />
                  <Text style={[styles.tableNum, isSelected && styles.tableTextSelected]}>
                    Mesa {table.numero}
                  </Text>
                  <Text style={[styles.tableCap, isSelected && styles.tableTextSelectedLight]}>
                    {cap} personas
                  </Text>
                  {!!table.ubicacion && (
                    <Text style={[styles.tableUbi, isSelected && styles.tableTextSelectedLight]}>
                      {table.ubicacion}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Atrás"
              variant="secondary"
              onPress={onBack}
              style={styles.halfBtn}
            />
            <Button
              title="Siguiente"
              onPress={onNext}
              disabled={!selectedTable}
              style={styles.halfBtn}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Step2TableSelection;
