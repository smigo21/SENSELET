import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMarketPrices } from '../../store/slices/marketPricesSlice';
import { RootState } from '../../store/types';
import { theme } from '../../constants/theme';

interface MarketPriceItem {
  id: string;
  crop_name: string;
  price: number;
  unit: string;
  market: string;
  region: string;
  date: string;
  change_percentage: number;
}

const MarketPricesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const marketPricesState = useSelector((state: RootState) => state.marketPrices);
  const { prices, loading, error } = marketPricesState;

  useEffect(() => {
    loadMarketPrices();
  }, []);

  const loadMarketPrices = async () => {
    try {
      const filters: any = {};
      if (selectedCrop) filters.crop = selectedCrop;
      if (searchQuery) filters.search = searchQuery;
      
      await dispatch(fetchMarketPrices(filters)).unwrap();
    } catch (error) {
      console.error('Failed to fetch market prices:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMarketPrices();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ET', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return theme.colors.success;
    if (change < 0) return theme.colors.error;
    return theme.colors.textSecondary;
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  const renderMarketPriceItem = ({ item }: { item: MarketPriceItem }) => (
    <View style={styles.priceItem}>
      <View style={styles.priceHeader}>
        <Text style={styles.cropName}>{item.crop_name}</Text>
        <Text style={styles.marketName}>{item.market}</Text>
      </View>
      
      <View style={styles.priceDetails}>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        <Text style={styles.unit}>per {item.unit}</Text>
      </View>

      <View style={styles.priceChangeContainer}>
        <Text style={[
          styles.priceChange,
          { color: getPriceChangeColor(item.change_percentage) }
        ]}>
          {getPriceChangeIcon(item.change_percentage)} {Math.abs(item.change_percentage)}%
        </Text>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.location}>📍 {item.region}</Text>
      </View>
    </View>
  );

  const uniqueCrops = [...new Set(prices.map(p => p.crop_name))];

  const filteredPrices = prices.filter(price => {
    const matchesCrop = !selectedCrop || price.crop_name === selectedCrop;
    const matchesSearch = !searchQuery || 
      price.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Prices</Text>
        <Text style={styles.subtitle}>
          Current crop prices across Ethiopian markets
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search crops, markets, or regions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cropFilterContainer}
        >
          <TouchableOpacity
            key="all"
            style={[
              styles.filterChip,
              !selectedCrop && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCrop('')}
          >
            <Text style={[
              styles.filterChipText,
              !selectedCrop && styles.filterChipTextActive,
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {uniqueCrops.map((crop) => (
            <TouchableOpacity
              key={crop}
              style={[
                styles.filterChip,
                selectedCrop === crop && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCrop(crop)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCrop === crop && styles.filterChipTextActive,
              ]}>
                {crop}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading market prices...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load market prices</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMarketPrices}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredPrices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No market prices found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPrices}
          renderItem={renderMarketPriceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.large,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: 'white',
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  searchContainer: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    fontSize: theme.typography.body.fontSize,
  },
  filterContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cropFilterContainer: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  filterChip: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    marginRight: theme.spacing.small,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: theme.spacing.medium,
  },
  priceItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.small,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.small,
  },
  cropName: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    flex: 1,
  },
  marketName: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
  },
  priceDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.small,
  },
  price: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.primary,
    marginRight: theme.spacing.small,
  },
  unit: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  priceChange: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  date: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  locationContainer: {
    alignItems: 'flex-start',
  },
  location: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    marginBottom: theme.spacing.medium,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  retryButtonText: {
    color: 'white',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
});

export default MarketPricesScreen;
