import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/theme';
import Button from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Common';
import styles from './Step3Confirmation.styles';

const Step3Confirmation = ({
  selectedDate,
  startTime,
  endTime,
  partySize,
  selectedTable,
  notes,
  loading,
  onConfirm,
  onBack,
}) => {
  const dateFormatted = new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Revisa y Confirma tu Reserva</Text>
      
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Fecha:</Text>
          <Text style={styles.summaryVal}>{dateFormatted}</Text>
        </View>

        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Horario:</Text>
          <Text style={styles.summaryVal}>{startTime} a {endTime}</Text>
        </View>

        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="account-group-outline" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Personas:</Text>
          <Text style={styles.summaryVal}>{partySize} {partySize === 1 ? 'persona' : 'personas'}</Text>
        </View>

        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="table-chair" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Mesa:</Text>
          <Text style={styles.summaryVal}>
            Mesa {selectedTable?.numero} ({selectedTable?.capacidad || selectedTable?.capacity} lugares, {selectedTable?.ubicacion || 'General'})
          </Text>
        </View>

        {!!notes && (
          <View style={styles.summaryNotesBlock}>
            <Text style={styles.summaryNotesTitle}>Notas especiales:</Text>
            <Text style={styles.summaryNotesText}>{notes}</Text>
          </View>
        )}
      </Card>

      <View style={styles.disclaimerCard}>
        <MaterialCommunityIcons name="alert-circle-outline" size={24} color={COLORS.warning} />
        <View style={styles.disclaimerTextContainer}>
          <Text style={styles.disclaimerTitle}>Información Importante</Text>
          <Text style={styles.disclaimerText}>
            La reserva se mantendrá activa por 15 minutos de cortesía después del inicio. Transcurrido ese tiempo sin presentarse, será liberada.
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Cambiar Mesa"
          variant="secondary"
          onPress={onBack}
          style={styles.halfBtn}
          loading={loading}
        />
        <Button
          title={loading ? 'Procesando...' : '✓ Confirmar Reserva'}
          onPress={onConfirm}
          style={styles.halfBtn}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};

export default Step3Confirmation;
