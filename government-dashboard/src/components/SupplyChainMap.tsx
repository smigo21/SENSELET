/**
 * Supply Chain Map Component
 * Interactive map showing real-time movement of agricultural products across Ethiopia
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import MapView, { Marker, Callout, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Card, Title, Subheading, Button, List, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../store/types';
import { theme } from '../constants/theme';

interface ShipmentLocation {
  id: string;
  shipmentNumber: string;
  latitude: number;
  longitude: number;
  status: 'IN_TRANSIT' | 'DELAYED' | 'COMPLETED' | 'LOST';
  cropType: string;
  quantity: number;
  destination: string;
  temperature: number;
  humidity: number;
  eta: string;
  vehicle: {
    licensePlate: string;
    type: string;
  };
}

interface SupplyChainMapProps {
  selectedRegion?: string;
  onShipmentSelect?: (shipment: ShipmentLocation) => void;
}

const SupplyChainMap: React.FC<SupplyChainMapProps> = ({ 
  selectedRegion, 
  onShipmentSelect 
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [mapRegion, setMapRegion] = useState({
    latitude: 9.1450,
    longitude: 38.7672,
    latitudeDelta: 5,
    longitudeDelta: 5,
  });
  
  const [shipmentLocations, setShipmentLocations] = useState<ShipmentLocation[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0); // Force re-render of map

  // Define status colors
  const statusColors = {
    IN_TRANSIT: '#2E7D32', // Green
    DELAYED: '#F57C00',    // Orange
    COMPLETED: '#1976D2',  // Blue
    LOST: '#D32F2F',       // Red
  };

  // Fetch real-time shipment data
  useEffect(() => {
    const fetchShipmentData = async () => {
      try {
        const regionParam = selectedRegion ? `?region=${selectedRegion}` : '';
        const response = await fetch(`/api/government/supply-chain/shipments/${regionParam}`, {
          headers: {
            'Authorization': `Token ${user?.token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setShipmentLocations(data.shipments || []);
          
          // Adjust map view based on data
          if (data.shipments && data.shipments.length > 0) {
            adjustMapViewToShipments(data.shipments);
          }
        } else {
          console.error('Error fetching shipment data');
        }
      } catch (error) {
        console.error('Error fetching shipment data:', error);
        Alert.alert('Error', 'Failed to load shipment data');
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentData();
    
    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(fetchShipmentData, 30000);
    
    return () => clearInterval(interval);
  }, [selectedRegion, user?.token]);

  // Adjust map view to include all shipments
  const adjustMapViewToShipments = (shipments: ShipmentLocation[]) => {
    if (shipments.length === 0) return;

    const lats = shipments.map(s => s.latitude);
    const lons = shipments.map(s => s.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    const latDelta = Math.max(0.1, (maxLat - minLat) * 1.1);
    const lonDelta = Math.max(0.1, (maxLon - minLon) * 1.1);
    
    setMapRegion({
      latitude: centerLat,
      longitude: centerLon,
      latitudeDelta: latDelta,
      longitudeDelta: lonDelta,
    });
  };

  // Handle shipment marker press
  const handleMarkerPress = (shipment: ShipmentLocation) => {
    setSelectedShipment(shipment);
    onShipmentSelect?.(shipment);
  };

  // Handle region change
  const handleRegionChange = (region: any) => {
    setMapRegion(region);
  };

  // Filter shipments by status
  const getShipmentsByStatus = (status: string) => {
    return shipmentLocations.filter(s => s.status === status);
  };

  // Render custom marker
  const renderMarker = (shipment: ShipmentLocation) => {
    return (
      <Marker
        key={shipment.id}
        coordinate={{
          latitude: shipment.latitude,
          longitude: shipment.longitude,
        }}
        pinColor={statusColors[shipment.status]}
        onPress={() => handleMarkerPress(shipment)}
      >
        <Callout>
          <View style={styles.calloutContainer}>
            <Title style={styles.calloutTitle}>{shipment.shipmentNumber}</Title>
            <Subheading>{shipment.cropType}</Subheading>
            <List.Item
              title="Status"
              description={shipment.status}
              left={() => <List.Icon icon="information" />}
            />
            <List.Item
              title="Quantity"
              description={`${shipment.quantity} kg`}
              left={() => <List.Icon icon="weight" />}
            />
            <List.Item
              title="Destination"
              description={shipment.destination}
              left={() => <List.Icon icon="map-marker" />}
            />
            <List.Item
              title="ETA"
              description={shipment.eta}
              left={() => <List.Icon icon="clock" />}
            />
          </View>
        </Callout>
      </Marker>
    );
  };

  // Render route between origin and destination
  const renderRoute = (shipment: ShipmentLocation) => {
    // In a real implementation, this would fetch actual route data
    // For now, we'll create a simple straight line
    const origin = { latitude: shipment.latitude - 0.5, longitude: shipment.longitude - 0.5 };
    const destination = { latitude: shipment.latitude + 0.5, longitude: shipment.longitude + 0.5 };
    
    return (
      <Polyline
        key={`route-${shipment.id}`}
        coordinates={[origin, destination]}
        strokeColor={statusColors[shipment.status]}
        strokeWidth={2}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Subheading>Loading map data...</Subheading>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          key={mapKey}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={handleRegionChange}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          {/* Render shipment markers and routes */}
          {shipmentLocations.map(shipment => (
            <React.Fragment key={shipment.id}>
              {renderMarker(shipment)}
              {renderRoute(shipment)}
            </React.Fragment>
          ))}
        </MapView>
      </View>

      {/* Selected Shipment Details */}
      {selectedShipment && (
        <Card style={styles.selectedShipmentCard}>
          <Card.Title
            title={selectedShipment.shipmentNumber}
            subtitle={selectedShipment.cropType}
            left={() => (
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: statusColors[selectedShipment.status] },
                ]}
              />
            )}
          />
          <Card.Content>
            <List.Section>
              <List.Item
                title="Status"
                description={selectedShipment.status}
                left={() => <List.Icon icon="information" />}
              />
              <List.Item
                title="Quantity"
                description={`${selectedShipment.quantity} kg`}
                left={() => <List.Icon icon="weight" />}
              />
              <List.Item
                title="Vehicle"
                description={`${selectedShipment.vehicle.type} - ${selectedShipment.vehicle.licensePlate}`}
                left={() => <List.Icon icon="truck" />}
              />
              <List.Item
                title="Destination"
                description={selectedShipment.destination}
                left={() => <List.Icon icon="map-marker" />}
              />
              <List.Item
                title="ETA"
                description={selectedShipment.eta}
                left={() => <List.Icon icon="clock" />}
              />
              <List.Item
                title="Temperature"
                description={`${selectedShipment.temperature}°C`}
                left={() => <List.Icon icon="thermometer" />}
              />
              <List.Item
                title="Humidity"
                description={`${selectedShipment.humidity}%`}
                left={() => <List.Icon icon="water" />}
              />
            </List.Section>
          </Card.Content>
          <Card.Actions>
            <Button 
              icon="track-changes" 
              onPress={() => {
                // Focus map on selected shipment
                setMapRegion({
                  ...mapRegion,
                  latitude: selectedShipment.latitude,
                  longitude: selectedShipment.longitude,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                });
                setMapKey(prev => prev + 1); // Force map re-render
              }}
            >
              Track on Map
            </Button>
            <Button 
              icon="alert" 
              onPress={() => Alert.alert(
                'Report Issue',
                'Do you want to report an issue with this shipment?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Report', onPress: () => console.log('Report issue:', selectedShipment.id) },
                ]
              )}
            >
              Report Issue
            </Button>
          </Card.Actions>
        </Card>
      )}

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{getShipmentsByStatus('IN_TRANSIT').length}</Title>
            <Subheading>In Transit</Subheading>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{getShipmentsByStatus('DELAYED').length}</Title>
            <Subheading>Delayed</Subheading>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{getShipmentsByStatus('COMPLETED').length}</Title>
            <Subheading>Completed</Subheading>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{getShipmentsByStatus('LOST').length}</Title>
            <Subheading>Lost</Subheading>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: Dimensions.get('window').height * 0.6,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  calloutContainer: {
    width: 200,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedShipmentCard: {
    margin: theme.spacing.medium,
    elevation: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.small,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.medium,
  },
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing.small,
    elevation: 2,
  },
});

export default SupplyChainMap;
