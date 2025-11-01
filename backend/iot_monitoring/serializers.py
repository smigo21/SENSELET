# EATMS Backend - IoT Monitoring Serializers
# Serializers for API serialization/deserialization

from rest_framework import serializers
from django.contrib.gis.geos import Point
from .models import (
    IoTDevice, SensorData, GeoFence, GeoFenceEvent,
    TemperatureAlert, DeviceMaintenance, DataQualityReport
)

class IoTDeviceSerializer(serializers.ModelSerializer):
    """Serializer for IoTDevice model"""
    vehicle_name = serializers.CharField(source='vehicle.license_plate', read_only=True)
    vehicle_id = serializers.UUIDField(source='vehicle.id')
    
    class Meta:
        model = IoTDevice
        fields = [
            'id', 'device_id', 'device_type', 'vehicle', 'vehicle_id', 'vehicle_name',
            'imei', 'sim_number', 'firmware_version', 'last_heartbeat',
            'battery_level', 'status', 'installation_date', 'last_maintenance',
            'notes'
        ]
        read_only_fields = ['id', 'installation_date', 'vehicle_name']

class SensorDataSerializer(serializers.ModelSerializer):
    """Serializer for SensorData model"""
    device_name = serializers.CharField(source='device.device_id', read_only=True)
    shipment_number = serializers.CharField(source='shipment.shipment_number', read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    
    class Meta:
        model = SensorData
        fields = [
            'id', 'device', 'device_name', 'shipment', 'shipment_number',
            'location', 'latitude', 'longitude', 'speed', 'heading', 'altitude',
            'temperature', 'humidity', 'pressure',
            'acceleration_x', 'acceleration_y', 'acceleration_z', 'shock_detected',
            'fuel_level', 'ignition_status', 'door_status',
            'timestamp', 'signal_strength', 'raw_data'
        ]
        read_only_fields = ['id', 'device_name', 'shipment_number', 'timestamp']
    
    def get_latitude(self, obj):
        if obj.location:
            return obj.location.y
        return None
    
    def get_longitude(self, obj):
        if obj.location:
            return obj.location.x
        return None
    
    def create(self, validated_data):
        # Handle location point creation
        location_data = validated_data.pop('location', None)
        if location_data and isinstance(location_data, dict):
            point = Point(location_data['longitude'], location_data['latitude'], srid=4326)
            validated_data['location'] = point
        
        return super().create(validated_data)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Convert location to lat/lon if it exists
        if data['location']:
            if isinstance(data['location'], dict):
                data['latitude'] = data['location'].get('y')
                data['longitude'] = data['location'].get('x')
                data['location'] = f"POINT ({data['longitude']} {data['latitude']})"
        
        return data

class GeoFenceSerializer(serializers.ModelSerializer):
    """Serializer for GeoFence model"""
    center_latitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    center_longitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = GeoFence
        fields = [
            'id', 'name', 'description', 'location', 'radius',
            'center_latitude', 'center_longitude',
            'alert_on_entry', 'alert_on_exit', 'alert_on_dwell',
            'dwell_time_threshold', 'is_active', 'created_by',
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'center_latitude', 'center_longitude', 'created_by_name', 'created_at']
    
    def create(self, validated_data):
        # Handle location point creation
        location_data = validated_data.pop('location', None)
        if location_data and isinstance(location_data, dict):
            point = Point(location_data['longitude'], location_data['latitude'], srid=4326)
            validated_data['location'] = point
            validated_data['center_latitude'] = location_data['latitude']
            validated_data['center_longitude'] = location_data['longitude']
        
        return super().create(validated_data)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Convert location to lat/lon for API response
        if data['location']:
            if isinstance(data['location'], str):
                # Parse POINT (x y) format
                coords = data['location'].replace('POINT (', '').replace(')', '').split()
                if len(coords) == 2:
                    data['latitude'] = float(coords[1])
                    data['longitude'] = float(coords[0])
                    data['location'] = {
                        'latitude': data['latitude'],
                        'longitude': data['longitude']
                    }
        
        return data

class GeoFenceEventSerializer(serializers.ModelSerializer):
    """Serializer for GeoFenceEvent model"""
    geofence_name = serializers.CharField(source='geofence.name', read_only=True)
    device_name = serializers.CharField(source='device.device_id', read_only=True)
    shipment_number = serializers.CharField(source='shipment.shipment_number', read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    
    class Meta:
        model = GeoFenceEvent
        fields = [
            'id', 'geofence', 'geofence_name', 'device', 'device_name',
            'shipment', 'shipment_number', 'event_type', 'location',
            'latitude', 'longitude', 'timestamp', 'duration'
        ]
        read_only_fields = ['id', 'geofence_name', 'device_name', 'shipment_number', 'timestamp']
    
    def get_latitude(self, obj):
        if obj.location:
            return obj.location.y
        return None
    
    def get_longitude(self, obj):
        if obj.location:
            return obj.location.x
        return None
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Convert location to lat/lon if it exists
        if data['location']:
            if isinstance(data['location'], dict):
                data['latitude'] = data['location'].get('y')
                data['longitude'] = data['location'].get('x')
                data['location'] = f"POINT ({data['longitude']} {data['latitude']})"
        
        return data

class TemperatureAlertSerializer(serializers.ModelSerializer):
    """Serializer for TemperatureAlert model"""
    shipment_number = serializers.CharField(source='shipment.shipment_number', read_only=True)
    device_name = serializers.CharField(source='device.device_id', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.username', read_only=True)
    
    class Meta:
        model = TemperatureAlert
        fields = [
            'id', 'shipment', 'shipment_number', 'device', 'device_name',
            'alert_data', 'severity', 'threshold_min', 'threshold_max',
            'current_value', 'duration_minutes', 'triggered_at',
            'acknowledged_at', 'resolved_at', 'resolved_by', 'resolved_by_name',
            'notes'
        ]
        read_only_fields = [
            'id', 'shipment_number', 'device_name', 'resolved_by_name',
            'triggered_at', 'acknowledged_at', 'resolved_at'
        ]

class DeviceMaintenanceSerializer(serializers.ModelSerializer):
    """Serializer for DeviceMaintenance model"""
    device_name = serializers.CharField(source='device.device_id', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.username', read_only=True)
    
    class Meta:
        model = DeviceMaintenance
        fields = [
            'id', 'device', 'device_name', 'maintenance_type', 'scheduled_date',
            'completed_date', 'status', 'technician_name', 'technician_contact',
            'description', 'parts_replaced', 'cost', 'created_by',
            'created_by_name', 'resolved_by', 'resolved_by_name', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'device_name', 'created_by_name', 'resolved_by_name',
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        # Set created_by from request user if not provided
        if 'created_by' not in validated_data and self.context.get('request'):
            validated_data['created_by'] = self.context['request'].user
        
        return super().create(validated_data)

class DataQualityReportSerializer(serializers.ModelSerializer):
    """Serializer for DataQualityReport model"""
    device_name = serializers.CharField(source='device.device_id', read_only=True)
    
    class Meta:
        model = DataQualityReport
        fields = [
            'id', 'device', 'device_name', 'date',
            'total_records', 'valid_records', 'invalid_records',
            'missing_location', 'missing_temperature', 'missing_humidity',
            'expected_uptime_minutes', 'actual_uptime_minutes', 'downtime_minutes',
            'successful_transmissions', 'failed_transmissions', 'avg_signal_strength',
            'completeness_score', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'device_name', 'created_at', 'updated_at']
    
    def validate_completeness_score(self, value):
        """Ensure completeness score is between 0 and 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Completeness score must be between 0 and 100")
        return value
    
    def validate(self, data):
        """Validate data consistency"""
        # Ensure valid records don't exceed total records
        if data.get('valid_records', 0) > data.get('total_records', 0):
            raise serializers.ValidationError("Valid records cannot exceed total records")
        
        # Ensure actual uptime doesn't exceed expected uptime
        if data.get('actual_uptime_minutes', 0) > data.get('expected_uptime_minutes', 0):
            raise serializers.ValidationError("Actual uptime cannot exceed expected uptime")
        
        # Ensure downtime equals expected minus actual uptime
        expected = data.get('expected_uptime_minutes', 0)
        actual = data.get('actual_uptime_minutes', 0)
        downtime = data.get('downtime_minutes', 0)
        
        if expected > 0 and actual + downtime != expected:
            raise serializers.ValidationError(
                f"Downtime minutes ({downtime}) should equal expected ({expected}) minus actual ({actual}) = {expected - actual}"
            )
        
        return data

# Bulk create serializer for sensor data
class BulkSensorDataSerializer(serializers.ListSerializer):
    """List serializer for bulk creating sensor data"""
    def create(self, validated_data):
        sensor_data_objects = [SensorData(**item) for item in validated_data]
        
        # Use bulk_create for better performance
        return SensorData.objects.bulk_create(sensor_data_objects)

class BulkSensorDataItemSerializer(serializers.ModelSerializer):
    """Serializer for individual sensor data items in bulk operations"""
    class Meta:
        model = SensorData
        fields = [
            'device', 'shipment', 'location', 'speed', 'heading', 'altitude',
            'temperature', 'humidity', 'pressure', 'acceleration_x', 'acceleration_y',
            'acceleration_z', 'shock_detected', 'fuel_level', 'ignition_status',
            'door_status', 'signal_strength', 'raw_data'
        ]
        list_serializer_class = BulkSensorDataSerializer
    
    def create(self, validated_data):
        # Handle location point creation
        location_data = validated_data.pop('location', None)
        if location_data and isinstance(location_data, dict):
            point = Point(location_data['longitude'], location_data['latitude'], srid=4326)
            validated_data['location'] = point
        
        return super().create(validated_data)
