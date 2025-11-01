# EATMS Backend - IoT Monitoring Views
# API endpoints for IoT device management and sensor data handling

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q, Count, Avg
from django.shortcuts import get_object_or_404
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from datetime import timedelta

from .models import (
    IoTDevice, SensorData, GeoFence, GeoFenceEvent,
    TemperatureAlert, DeviceMaintenance, DataQualityReport
)
from .serializers import (
    IoTDeviceSerializer, SensorDataSerializer, GeoFenceSerializer,
    GeoFenceEventSerializer, TemperatureAlertSerializer,
    DeviceMaintenanceSerializer, DataQualityReportSerializer
)
from ..shipments.models import Shipment
from ..transport.models import TransportVehicle

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200

class IoTDeviceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing IoT devices"""
    queryset = IoTDevice.objects.select_related('vehicle').all()
    serializer_class = IoTDeviceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by vehicle if specified
        vehicle_id = self.request.query_params.get('vehicle_id')
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        
        # Filter by device type if specified
        device_type = self.request.query_params.get('device_type')
        if device_type:
            queryset = queryset.filter(device_type=device_type)
        
        # Filter by status if specified
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def send_command(self, request, pk=None):
        """Send command to IoT device"""
        device = self.get_object()
        command = request.data.get('command')
        parameters = request.data.get('parameters', {})
        
        # In a real implementation, this would send the command to the device
        # through MQTT or another communication protocol
        # For now, we'll just log it
        print(f"Sending command {command} to device {device.device_id} with params {parameters}")
        
        return Response({
            'status': 'success',
            'message': f'Command {command} sent to device {device.device_id}',
            'command': command,
            'parameters': parameters
        })
    
    @action(detail=True, methods=['get'])
    def health_status(self, request, pk=None):
        """Get device health status"""
        device = self.get_object()
        
        # Get recent sensor data
        recent_data = SensorData.objects.filter(
            device=device,
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).aggregate(
            latest_temp=Avg('temperature'),
            latest_humidity=Avg('humidity'),
            latest_location='location',
            data_count=Count('id')
        )
        
        # Calculate battery status
        battery_status = "UNKNOWN"
        if device.battery_level is not None:
            if device.battery_level > 50:
                battery_status = "GOOD"
            elif device.battery_level > 20:
                battery_status = "LOW"
            else:
                battery_status = "CRITICAL"
        
        # Check if device is responsive
        time_since_heartbeat = timezone.now() - device.last_heartbeat if device.last_heartbeat else None
        is_responsive = time_since_heartbeat and time_since_heartbeat < timedelta(minutes=30)
        
        return Response({
            'device_id': device.device_id,
            'device_type': device.device_type,
            'vehicle': device.vehicle.license_plate,
            'status': device.status,
            'battery_level': device.battery_level,
            'battery_status': battery_status,
            'is_responsive': is_responsive,
            'last_heartbeat': device.last_heartbeat,
            'recent_data': recent_data
        })
    
    @action(detail=False, methods=['get'])
    def devices_by_vehicle(self, request):
        """Get all devices for a specific vehicle"""
        vehicle_id = request.query_params.get('vehicle_id')
        if not vehicle_id:
            return Response(
                {'error': 'vehicle_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            vehicle = TransportVehicle.objects.get(id=vehicle_id)
            devices = IoTDevice.objects.filter(vehicle=vehicle)
            serializer = self.get_serializer(devices, many=True)
            return Response(serializer.data)
        except TransportVehicle.DoesNotExist:
            return Response(
                {'error': 'Vehicle not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class SensorDataViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for retrieving sensor data"""
    queryset = SensorData.objects.select_related('device', 'shipment').all()
    serializer_class = SensorDataSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by device if specified
        device_id = self.query_params.get('device_id')
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        
        # Filter by shipment if specified
        shipment_id = self.query_params.get('shipment_id')
        if shipment_id:
            queryset = queryset.filter(shipment_id=shipment_id)
        
        # Filter by date range if specified
        start_date = self.query_params.get('start_date')
        end_date = self.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        # Filter by location if specified (within radius)
        lat = self.query_params.get('lat')
        lon = self.query_params.get('lon')
        radius = self.query_params.get('radius', 1000)  # Default 1km radius
        
        if lat and lon:
            point = Point(float(lon), float(lat), srid=4326)
            queryset = queryset.filter(
                location__distance_lte=(point, radius)
            )
        
        # Order by timestamp
        queryset = queryset.order_by('-timestamp')
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple sensor data entries at once"""
        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def latest_by_device(self, request):
        """Get latest sensor reading for each device"""
        device_id = request.query_params.get('device_id')
        
        if device_id:
            # Get latest for a specific device
            latest_data = SensorData.objects.filter(device_id=device_id).latest('timestamp')
            serializer = self.get_serializer(latest_data)
            return Response(serializer.data)
        else:
            # Get latest for all devices
            latest_data = []
            for device in IoTDevice.objects.all():
                try:
                    data = SensorData.objects.filter(device=device).latest('timestamp')
                    latest_data.append(data)
                except SensorData.DoesNotExist:
                    continue
            
            serializer = self.get_serializer(latest_data, many=True)
            return Response(serializer.data)

class GeoFenceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing geofences"""
    queryset = GeoFence.objects.all()
    serializer_class = GeoFenceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    @action(detail=True, methods=['get'])
    def check_device_status(self, request, pk=None):
        """Check if a device is inside/outside a geofence"""
        geofence = self.get_object()
        device_id = request.query_params.get('device_id')
        
        if not device_id:
            return Response(
                {'error': 'device_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            device = IoTDevice.objects.get(device_id=device_id)
            # Get latest location for the device
            latest_data = SensorData.objects.filter(device=device).latest('timestamp')
            
            # Check if location is within geofence
            if latest_data.location:
                distance = geofence.location.distance(latest_data.location) * 1000  # Convert to meters
                is_inside = distance <= float(geofence.radius)
                
                return Response({
                    'device_id': device_id,
                    'geofence_id': geofence.id,
                    'geofence_name': geofence.name,
                    'distance_from_center': round(distance, 2),
                    'radius': geofence.radius,
                    'is_inside': is_inside,
                    'location': {
                        'latitude': latest_data.location.y,
                        'longitude': latest_data.location.x
                    },
                    'timestamp': latest_data.timestamp
                })
            else:
                return Response(
                    {'error': 'No location data available for this device'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except IoTDevice.DoesNotExist:
            return Response(
                {'error': 'Device not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except SensorData.DoesNotExist:
            return Response(
                {'error': 'No sensor data available for this device'},
                status=status.HTTP_404_NOT_FOUND
            )

class GeoFenceEventViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for retrieving geofence events"""
    queryset = GeoFenceEvent.objects.select_related('geofence', 'device', 'shipment').all()
    serializer_class = GeoFenceEventSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by geofence if specified
        geofence_id = self.query_params.get('geofence_id')
        if geofence_id:
            queryset = queryset.filter(geofence_id=geofence_id)
        
        # Filter by device if specified
        device_id = self.query_params.get('device_id')
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        
        # Filter by event type if specified
        event_type = self.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by date range if specified
        start_date = self.query_params.get('start_date')
        end_date = self.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset

class TemperatureAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for managing temperature alerts"""
    queryset = TemperatureAlert.objects.select_related('shipment', 'device', 'resolved_by').all()
    serializer_class = TemperatureAlertSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by shipment if specified
        shipment_id = self.query_params.get('shipment_id')
        if shipment_id:
            queryset = queryset.filter(shipment_id=shipment_id)
        
        # Filter by device if specified
        device_id = self.query_params.get('device_id')
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        
        # Filter by severity if specified
        severity = self.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by status (resolved/unresolved)
        resolved = self.query_params.get('resolved')
        if resolved is not None:
            if resolved.lower() == 'true':
                queryset = queryset.filter(resolved_at__isnull=False)
            else:
                queryset = queryset.filter(resolved_at__isnull=True)
        
        # Filter by date range if specified
        start_date = self.query_params.get('start_date')
        end_date = self.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(triggered_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(triggered_at__lte=end_date)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge a temperature alert"""
        alert = self.get_object()
        alert.acknowledged_at = timezone.now()
        alert.save()
        
        return Response({
            'status': 'success',
            'message': 'Alert acknowledged',
            'alert_id': alert.id,
            'acknowledged_at': alert.acknowledged_at
        })
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a temperature alert"""
        alert = self.get_object()
        alert.resolved_at = timezone.now()
        alert.resolved_by = request.user
        alert.notes = request.data.get('notes', alert.notes)
        alert.save()
        
        return Response({
            'status': 'success',
            'message': 'Alert resolved',
            'alert_id': alert.id,
            'resolved_at': alert.resolved_at,
            'resolved_by': alert.resolved_by.username
        })

class DeviceMaintenanceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing device maintenance"""
    queryset = DeviceMaintenance.objects.select_related('device', 'created_by', 'resolved_by').all()
    serializer_class = DeviceMaintenanceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by device if specified
        device_id = self.query_params.get('device_id')
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        
        # Filter by maintenance type if specified
        maintenance_type = self.query_params.get('maintenance_type')
        if maintenance_type:
            queryset = queryset.filter(maintenance_type=maintenance_type)
        
        # Filter by status if specified
        status = self.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by upcoming maintenance
        upcoming = self.query_params.get('upcoming')
        if upcoming and upcoming.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(
                scheduled_date__date__gte=today,
                status__in=['SCHEDULED', 'IN_PROGRESS']
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_in_progress(self, request, pk=None):
        """Mark maintenance as in progress"""
        maintenance = self.get_object()
        maintenance.status = 'IN_PROGRESS'
        maintenance.save()
        
        return Response({
            'status': 'success',
            'message': 'Maintenance marked as in progress',
            'maintenance_id': maintenance.id,
            'status': maintenance.status
        })
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark maintenance as completed"""
        maintenance = self.get_object()
        maintenance.status = 'COMPLETED'
        maintenance.completed_date = timezone.now()
        maintenance.notes = request.data.get('notes', maintenance.notes)
        maintenance.save()
        
        return Response({
            'status': 'success',
            'message': 'Maintenance marked as completed',
            'maintenance_id': maintenance.id,
            'status': maintenance.status,
            'completed_date': maintenance.completed_date
        })

class DataQualityReportViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for retrieving data quality reports"""
    queryset = DataQualityReport.objects.select_related('device').all()
    serializer_class = DataQualityReportSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by device if specified
        device_id = self.query_params.get('device_id')
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        
        # Filter by date range if specified
        start_date = self.query_params.get('start_date')
        end_date = self.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter by completeness score if specified
        min_score = self.query_params.get('min_completeness')
        if min_score:
            queryset = queryset.filter(completeness_score__gte=min_score)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of data quality metrics"""
        device_id = request.query_params.get('device_id')
        start_date = request.query_params.get('start_date', timezone.now().date() - timedelta(days=30))
        end_date = request.query_params.get('end_date', timezone.now().date())
        
        queryset = self.get_queryset().filter(
            date__gte=start_date,
            date__lte=end_date
        )
        
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        
        summary = queryset.aggregate(
            total_devices=Count('device', distinct=True),
            avg_completeness=Avg('completeness_score'),
            total_records=Sum('total_records'),
            valid_records=Sum('valid_records'),
            invalid_records=Sum('invalid_records'),
            total_downtime=Sum('downtime_minutes'),
            avg_signal_strength=Avg('avg_signal_strength')
        )
        
        return Response(summary)
