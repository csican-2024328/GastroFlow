import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import { Card } from '../../../shared/components/Common';
import Button from '../../../shared/components/Button';
import { COLORS } from '../../../shared/constants/theme';
import { useOrderCart } from '../hooks/useOrderCart';
import styles from './OrderTypeScreen.styles';

const OPTIONS = [
  { value: 'EN_MESA', label: 'En Mesa', subtitle: 'Comer aquí', icon: 'silverware-fork-knife' },
  { value: 'A_DOMICILIO', label: 'A Domicilio', subtitle: 'Envío a casa', icon: 'moped' },
  { value: 'PARA_LLEVAR', label: 'Para Llevar', subtitle: 'Retiro en el restaurante', icon: 'shopping-outline' },
];

const OrderTypeScreen = ({ navigation }) => {
  const { tipoPedido, setTipoPedido } = useOrderCart();
  const [selected, setSelected] = useState(tipoPedido);

  const handleNext = () => {
    if (!selected) return;
    setTipoPedido(selected);
    navigation.navigate('CheckoutDetails');
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={styles.title}>¿Cómo quieres tu pedido?</Text>

        {OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <TouchableOpacity key={option.value} onPress={() => setSelected(option.value)} activeOpacity={0.85}>
              <Card style={[styles.optionCard, isSelected && styles.optionCardSelected]}>
                <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={28}
                    color={isSelected ? COLORS.background : COLORS.primary}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionTextSelected]}>{option.label}</Text>
                  <Text style={[styles.optionSubtitle, isSelected && styles.optionTextSelected]}>
                    {option.subtitle}
                  </Text>
                </View>
                {isSelected && <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.background} />}
              </Card>
            </TouchableOpacity>
          );
        })}

        <Button title="Siguiente" onPress={handleNext} disabled={!selected} style={styles.nextButton} />
      </View>
    </ScreenBackground>
  );
};

export default OrderTypeScreen;
