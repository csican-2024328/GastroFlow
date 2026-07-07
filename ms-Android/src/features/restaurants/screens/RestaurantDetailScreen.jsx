import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { Card } from '../../../shared/components/Common';

const RestaurantDetailScreen = ({ route }) => {
  const { restaurant } = route.params;

  return (
    <ScrollView style={styles.container}>
      {restaurant.image ? (
        <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
      ) : (
        <View style={[styles.headerImage, styles.placeholder]}>
          <Text style={styles.placeholderText}>Imagen no disponible</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{restaurant.name}</Text>
        </View>

        <Card style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Dirección</Text>
          <Text style={styles.description}>{restaurant.address || 'No disponible'}</Text>
        </Card>

        <Card style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {restaurant.description || 'Disfruta de la mejor experiencia gastronómica.'}
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  placeholder: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  descriptionCard: {
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    lineHeight: 22,
  },
});

export default RestaurantDetailScreen;
