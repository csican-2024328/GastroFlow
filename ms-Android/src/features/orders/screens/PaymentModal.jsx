import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/theme';
import { Card } from '../../../shared/components/Common';
import Button from '../../../shared/components/Button';
import styles from './PaymentModal.styles';

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const METHODS = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: 'cash' },
  { value: 'TARJETA', label: 'Tarjeta', icon: 'credit-card' },
  { value: 'TRANSFERENCIA', label: 'Transf.', icon: 'bank' },
];

const PaymentModal = ({ order, onClose, onConfirm, isSaving }) => {
  const [method, setMethod] = useState('EFECTIVO');
  const [tip, setTip] = useState('0');
  const [extraCharges, setExtraCharges] = useState('0');

  const subtotal = Number(order?.subtotal || 0);
  const impuesto = Number(order?.impuesto || 0);
  const descuento = Number(order?.descuento || 0);
  const total = Number(order?.total || 0);

  const handleSubmit = () => {
    onConfirm({
      metodoPago: method,
      propina: Math.max(0, Number(tip) || 0),
      cargosExtra: Math.max(0, Number(extraCharges) || 0),
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%', alignItems: 'center' }}
        >
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Pago del pedido</Text>
              <Text style={styles.subtitle}>Revisa el resumen y selecciona tu método de pago</Text>

              {/* Breakdown */}
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Resumen de Cuenta</Text>
                
                {order.items?.map((item, idx) => (
                  <View key={`${item.tipo}-${idx}`} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel} numberOfLines={1}>
                      {item.cantidad}x {item.nombre}
                    </Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(item.subtotal ?? item.precioUnitario * item.cantidad)}
                    </Text>
                  </View>
                ))}

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Impuesto</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(impuesto)}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Descuento</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                    -{formatCurrency(descuento)}
                  </Text>
                </View>

                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                </View>
              </Card>

              {/* Payment Methods */}
              <Text style={styles.fieldLabel}>Método de Pago</Text>
              <View style={styles.methodRow}>
                {METHODS.map((m) => {
                  const isActive = method === m.value;
                  return (
                    <TouchableOpacity
                      key={m.value}
                      style={[styles.methodTab, isActive && styles.methodTabActive]}
                      onPress={() => setMethod(m.value)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={m.icon}
                        size={14}
                        color={isActive ? COLORS.background : COLORS.secondary}
                      />
                      <Text style={[styles.methodTabText, isActive && styles.methodTabTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tip & Extra Charges */}
              <View style={styles.inputsGrid}>
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Propina (Q)</Text>
                  <TextInput
                    style={styles.input}
                    value={tip}
                    onChangeText={setTip}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.secondary}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Cargos Extra (Q)</Text>
                  <TextInput
                    style={styles.input}
                    value={extraCharges}
                    onChangeText={setExtraCharges}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.secondary}
                  />
                </View>
              </View>

              {/* Actions */}
              <View style={styles.buttonRow}>
                <Button
                  title="Cancelar"
                  onPress={onClose}
                  style={styles.button}
                  variant="secondary"
                  disabled={isSaving}
                />
                <Button
                  title={isSaving ? 'Procesando...' : 'Confirmar Pago'}
                  onPress={handleSubmit}
                  style={styles.button}
                  loading={isSaving}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default PaymentModal;
