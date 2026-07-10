import { useCallback } from 'react';
import { View, TextInput, FlatList, StyleSheet, RefreshControl, ActivityIndicator, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRestaurants } from '../hooks/useRestaurants';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { LoadingSpinner, EmptyState } from '../../../shared/components/Common';
import ScreenBackground from '../../../shared/components/ScreenBackground';
import RestaurantCard from '../components/RestaurantCard';

const RestaurantsListScreen = ({ navigation }) => {
  const {
    restaurants,
    loading,
    loadingMore,
    error,
    search,
    setSearch,
    refresh,
    loadMore,
  } = useRestaurants();
  const { width } = useWindowDimensions();
  const numColumns = width >= 700 ? 2 : 1;

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  if (loading && !restaurants.length && !search) return <LoadingSpinner />;

  return (
    <ScreenBackground>
      <View style={styles.searchBar}>
        {loading && search ? (
          <ActivityIndicator size="small" color={COLORS.secondary} />
        ) : (
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.secondary} />
        )}
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o categoría..."
          placeholderTextColor={COLORS.secondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {error && !restaurants.length ? (
        <EmptyState message={error} />
      ) : (
        <FlatList
          key={numColumns}
          data={restaurants}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          renderItem={({ item }) => (
            <View style={numColumns > 1 ? styles.columnItem : undefined}>
              <RestaurantCard
                restaurant={item}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id })}
              />
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={loading && !loadingMore} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListEmptyComponent={
            <EmptyState
              message={search ? `No hay restaurantes que coincidan con "${search}"` : 'No hay restaurantes disponibles'}
            />
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={COLORS.primary} style={styles.footerLoader} /> : null
          }
        />
      )}
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    padding: 0,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
    flexGrow: 1,
  },
  row: {
    gap: SPACING.md,
  },
  columnItem: {
    flex: 1,
  },
  footerLoader: {
    marginVertical: SPACING.lg,
  },
});

export default RestaurantsListScreen;
