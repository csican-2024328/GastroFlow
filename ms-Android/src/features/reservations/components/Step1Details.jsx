import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/theme';
import Button from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Common';
import styles from './Step1Details.styles';

const START_TIMES = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00'
];

const Step1Details = ({ initialValues, onNext, loading, showAlert }) => {
  const [selectedDate, setSelectedDate] = useState(initialValues.selectedDate || '');
  const [startTime, setStartTime] = useState(initialValues.startTime || '');
  const [endTime, setEndTime] = useState(initialValues.endTime || '');
  const [partySize, setPartySize] = useState(initialValues.partySize || 2);
  const [notes, setNotes] = useState(initialValues.notes || '');

  // Generar los próximos 14 días
  const dateOptions = useMemo(() => {
    const days = [];
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${d}`;
      
      days.push({
        dateString,
        dayNum: date.getDate(),
        dayOfWeek: weekdays[date.getDay()],
        monthLabel: months[date.getMonth()],
      });
    }
    return days;
  }, []);

  // Calcular horas de fin válidas
  const endTimeOptions = useMemo(() => {
    if (!startTime) return [];
    const startIndex = START_TIMES.indexOf(startTime);
    if (startIndex === -1) return [];
    return START_TIMES.slice(startIndex + 2, startIndex + 7);
  }, [startTime]);

  const handleStartTimeSelect = (time) => {
    setStartTime(time);
    const startIndex = START_TIMES.indexOf(time);
    if (startIndex !== -1 && startIndex + 4 < START_TIMES.length) {
      setEndTime(START_TIMES[startIndex + 4]); // 2 horas más tarde por defecto
    } else {
      setEndTime('');
    }
  };

  const handleSubmit = () => {
    if (!selectedDate) {
      showAlert('error', 'Falta información', 'Por favor selecciona una fecha para tu reserva.');
      return;
    }
    if (!startTime) {
      showAlert('error', 'Falta información', 'Por favor selecciona la hora de inicio.');
      return;
    }
    if (!endTime) {
      showAlert('error', 'Falta información', 'Por favor selecciona la hora de fin.');
      return;
    }

    onNext({
      selectedDate,
      startTime,
      endTime,
      partySize: Number(partySize),
      notes,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>1. Selecciona la Fecha</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateSelector}
      >
        {dateOptions.map((opt) => {
          const isSelected = selectedDate === opt.dateString;
          return (
            <TouchableOpacity
              key={opt.dateString}
              style={[styles.dateCard, isSelected && styles.dateCardActive]}
              onPress={() => setSelectedDate(opt.dateString)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateMonth, isSelected && styles.textActive]}>
                {opt.monthLabel.toUpperCase()}
              </Text>
              <Text style={[styles.dateNum, isSelected && styles.textActive]}>
                {opt.dayNum}
              </Text>
              <Text style={[styles.dateDay, isSelected && styles.textActive]}>
                {opt.dayOfWeek}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>2. Hora de Inicio</Text>
      <View style={styles.timeGrid}>
        {START_TIMES.map((time) => {
          const isSelected = startTime === time;
          return (
            <TouchableOpacity
              key={time}
              style={[styles.timeButton, isSelected && styles.timeButtonActive]}
              onPress={() => handleStartTimeSelect(time)}
              activeOpacity={0.7}
            >
              <Text style={[styles.timeButtonText, isSelected && styles.timeButtonTextActive]}>
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {startTime !== '' && (
        <>
          <Text style={styles.sectionTitle}>3. Hora de Fin</Text>
          <View style={styles.timeGrid}>
            {endTimeOptions.map((time) => {
              const isSelected = endTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeButton, isSelected && styles.timeButtonActive]}
                  onPress={() => setEndTime(time)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timeButtonText, isSelected && styles.timeButtonTextActive]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>4. Cantidad de Personas</Text>
      <Card style={styles.partyCard}>
        <TouchableOpacity
          style={styles.partyBtn}
          onPress={() => setPartySize(prev => Math.max(1, prev - 1))}
        >
          <MaterialCommunityIcons name="minus" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.partyValue}>{partySize}</Text>
        <TouchableOpacity
          style={styles.partyBtn}
          onPress={() => setPartySize(prev => Math.min(20, prev + 1))}
        >
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </Card>

      <Text style={styles.sectionTitle}>Notas Especiales (Opcional)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Ej: Cumpleaños, alergias, mesa cerca de la ventana..."
        placeholderTextColor={COLORS.secondary}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <Button
        title={loading ? 'Verificando...' : 'Siguiente: Seleccionar Mesa →'}
        onPress={handleSubmit}
        loading={loading}
        style={styles.nextBtn}
      />
    </ScrollView>
  );
};

export default Step1Details;
