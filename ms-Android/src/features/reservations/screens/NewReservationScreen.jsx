import { useState } from 'react';
import { View, Text } from 'react-native';
import styles from './NewReservationScreen.styles';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import AppAlertModal from '../../../shared/components/AppAlertModal';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { useAvailableTables } from '../hooks/useAvailableTables';
import { useReservations } from '../hooks/useReservations';
import Step1Details from '../components/Step1Details';
import Step2TableSelection from '../components/Step2TableSelection';
import Step3Confirmation from '../components/Step3Confirmation';

const NewReservationScreen = ({ route, navigation }) => {
  const { restaurant } = route.params || {};
  const { fetchAvailableTables, tables, loading: loadingTables } = useAvailableTables();
  const { createReservation, loading: creatingReservation } = useReservations();
  const { alertProps, showAlert } = useAppAlert();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedDate: '',
    startTime: '',
    endTime: '',
    partySize: 2,
    notes: '',
  });
  const [selectedTable, setSelectedTable] = useState(null);

  const handleStep1Submit = async (step1Data) => {
    setFormData(step1Data);
    try {
      await fetchAvailableTables(restaurant._id, step1Data.selectedDate, step1Data.startTime, step1Data.endTime);
      setStep(2);
    } catch (err) {
      showAlert('error', 'Error', err.message || 'No se pudo consultar la disponibilidad de mesas.');
    }
  };

  const handleStep2Submit = () => {
    if (!selectedTable) {
      showAlert('error', 'Selección requerida', 'Por favor selecciona una mesa para continuar.');
      return;
    }
    setStep(3);
  };

  const handleConfirmReservation = async () => {
    const payload = {
      restaurantID: restaurant._id,
      mesaID: selectedTable._id,
      fechaReserva: formData.selectedDate,
      horaInicio: formData.startTime,
      horaFin: formData.endTime,
      cantidadPersonas: Number(formData.partySize),
      notas: formData.notes.trim() || null,
    };

    try {
      await createReservation(payload);
      showAlert(
        'success',
        '¡Reserva Creada!',
        'Tu reservación ha sido registrada con estado PENDIENTE.',
        () => {
          navigation.navigate('ReservationsList');
        }
      );
    } catch (err) {
      showAlert('error', 'Error al reservar', err.message || 'La mesa seleccionada no pudo reservarse. Puede que ya esté ocupada.');
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName}>{restaurant?.name || 'Reservar Mesa'}</Text>
          <Text style={styles.stepIndicator}>Paso {step} de 3</Text>
        </View>

        {/* Barra de progreso visual */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>

        {step === 1 && (
          <Step1Details
            initialValues={formData}
            onNext={handleStep1Submit}
            loading={loadingTables}
            showAlert={showAlert}
          />
        )}

        {step === 2 && (
          <Step2TableSelection
            tables={tables}
            partySize={formData.partySize}
            selectedDate={formData.selectedDate}
            startTime={formData.startTime}
            endTime={formData.endTime}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            loading={loadingTables}
            onNext={handleStep2Submit}
            onBack={() => {
              setStep(1);
              setSelectedTable(null);
            }}
          />
        )}

        {step === 3 && (
          <Step3Confirmation
            selectedDate={formData.selectedDate}
            startTime={formData.startTime}
            endTime={formData.endTime}
            partySize={formData.partySize}
            selectedTable={selectedTable}
            notes={formData.notes}
            loading={creatingReservation}
            onConfirm={handleConfirmReservation}
            onBack={() => setStep(2)}
          />
        )}
      </View>
      <AppAlertModal {...alertProps} />
    </ScreenBackground>
  );
};

export default NewReservationScreen;
