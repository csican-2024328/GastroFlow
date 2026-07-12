import {
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import styles from './StatusFilterBar.styles';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'CONFIRMADA', label: 'Confirmadas' },
  { value: 'CANCELADA', label: 'Canceladas' },
];

const StatusFilterBar = ({ selectedFilter, onSelectFilter }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {FILTER_OPTIONS.map((opt) => {
        const isSelected = selectedFilter === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterTab, isSelected && styles.filterTabActive]}
            onPress={() => onSelectFilter(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, isSelected && styles.filterTabTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default StatusFilterBar;
