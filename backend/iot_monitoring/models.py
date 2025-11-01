# EATMS Backend - IoT Monitoring Models
# Models for IoT devices, sensors, and data collection

from django.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point
from django.conf import settings
import uuid
import json
from datetime import datetime

class IoTDevice(models.Model):
    """Model representing IoT devices installed on transport vehicles"""
    DEVICE_TYPES = [
        ('GPS', 'GPS Tracker'),
        ('TEMP_HUMIDITY', 'Temperature & Humidity Sensor'),
        ('SHOCK', 'Shock/Vibration Sensor'),
        ('COMBO', 'Combined Sensor'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('MAINTENANCE', 'Under Maintenance'),
        ('ERROR', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device_id = models.CharField(max_length=100, unique=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPES)
    vehicle = models.ForeignKey('transport.TransportVehicle', on_delete=models.CASCADE, related_name='iot_devices')
    imei = models.CharField(max_length=20, unique=True, null=True, blank=True)
    sim_number = models.CharField(max_length=20, null=True, blank=True)
    firmware_version = models.CharField(max_length=50, null=True, blank=True)
    last_heartbeat = models.DateTimeField(null=True, blank=True)
    battery_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    installation_date = models.DateTimeField(auto_now_add=True)
    last_maintenance = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.device_id} ({self.device_type}) on {self.vehicle.license_plate}"
    
    class Meta:
        ordering = ['-installation_date']

class SensorData(models.Model):
    """Model to store sensor readings from IoT devices"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(IoTDevice, on_delete=models.CASCADE, related_name='sensor_data')
    shipment = models.ForeignKey('shipments.Shipment', on_delete=models.CASCADE, null=True, blank=True, related_name='sensor_readings')
    
    # GPS data
    location = gis_models.PointField(srid=4326, null=True, blank=True)
    speed = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)  # km/h
    heading = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)  # degrees
    altitude = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # meters
    
    # Environmental sensors
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Celsius
    humidity = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Percentage
    pressure = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)  # hPa
    
    # Motion sensors
    acceleration_x = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)  # g-force
    acceleration_y = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    acceleration_z = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    shock_detected = models.BooleanField(default=False)
    
    # Additional data
    fuel_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Percentage
    ignition_status = models.BooleanField(null=True, blank=True)
    door_status = models.JSONField(null=True, blank=True)  # JSON object for multiple doors
    
    # Metadata
    timestamp = models.DateTimeField(auto_now_add=True)
    signal_strength = models.IntegerField(null=True, blank=True)  # RSSI
    raw_data = models.JSONField(null=True, blank=True)  # Raw sensor data for debugging
    
    def __str__(self):
        return f"Sensor data from {self.device.device_id} at {self.timestamp}"
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['device', 'timestamp']),
            models.Index(fields=['shipment', 'timestamp']),
        ]

class GeoFence(models.Model):
    """Model to define geofenced areas for monitoring"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    location = gis_models.PointField(srid=4326)
    radius = models.DecimalField(max_digits=10, decimal_places=2)  # meters
    center_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    center_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Alert configuration
    alert_on_entry = models.BooleanField(default=True)
    alert_on_exit = models.BooleanField(default=True)
    alert_on_dwell = models.BooleanField(default=False)
    dwell_time_threshold = models.IntegerField(default=300)  # seconds
    
    # Active status
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    @property
    def center_point(self):
        return Point(self.center_longitude, self.center_latitude, srid=4326)

class GeoFenceEvent(models.Model):
    """Model to track geofence entry/exit events"""
    EVENT_TYPES = [
        ('ENTRY', 'Entry'),
        ('EXIT', 'Exit'),
        ('DWELL', 'Dwell'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    geofence = models.ForeignKey(GeoFence, on_delete=models.CASCADE, related_name='events')
    device = models.ForeignKey(IoTDevice, on_delete=models.CASCADE)
    shipment = models.ForeignKey('shipments.Shipment', on_delete=models.CASCADE, null=True, blank=True)
    event_type = models.CharField(max_length=10, choices=EVENT_TYPES)
    location = gis_models.PointField(srid=4326)
    timestamp = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(null=True, blank=True)  # For dwell events
    
    def __str__(self):
        return f"{self.event_type} event at {self.timestamp} for {self.geofence.name}"
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['geofence', 'timestamp']),
            models.Index(fields=['device', 'timestamp']),
        ]

class TemperatureAlert(models.Model):
    """Model for temperature-based alerts"""
    SEVERITY_LEVELS = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shipment = models.ForeignKey('shipments.Shipment', on_delete=models.CASCADE)
    device = models.ForeignKey(IoTDevice, on_delete=models.CASCADE)
    
    alert_data = models.JSONField()
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    threshold_min = models.DecimalField(max_digits=5, decimal_places=2)
    threshold_max = models.DecimalField(max_digits=5, decimal_places=2)
    current_value = models.DecimalField(max_digits=5, decimal_places=2)
    duration_minutes = models.IntegerField(default=5)  # How long the condition persisted
    
    triggered_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_temp_alerts')
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Temperature alert for {self.shipment.shipment_number} - {self.severity}"
    
    class Meta:
        ordering = ['-triggered_at']
        indexes = [
            models.Index(fields=['shipment', 'triggered_at']),
            models.Index(fields=['device', 'triggered_at']),
        ]

class DeviceMaintenance(models.Model):
    """Model to track device maintenance schedules"""
    MAINTENANCE_TYPES = [
        ('ROUTINE', 'Routine Check'),
        ('REPAIR', 'Repair'),
        ('CALIBRATION', 'Calibration'),
        ('REPLACEMENT', 'Replacement'),
    ]
    
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(IoTDevice, on_delete=models.CASCADE, related_name='maintenance_records')
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPES)
    scheduled_date = models.DateTimeField()
    completed_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    
    technician_name = models.CharField(max_length=100, blank=True)
    technician_contact = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    parts_replaced = models.JSONField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.maintenance_type} for {self.device.device_id} - {self.status}"
    
    class Meta:
        ordering = ['-scheduled_date']
        indexes = [
            models.Index(fields=['device', 'scheduled_date']),
            models.Index(fields=['status', 'scheduled_date']),
        ]

class DataQualityReport(models.Model):
    """Model for monitoring data quality from IoT devices"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(IoTDevice, on_delete=models.CASCADE, related_name='quality_reports')
    date = models.DateField()
    
    # Data quality metrics
    total_records = models.IntegerField(default=0)
    valid_records = models.IntegerField(default=0)
    invalid_records = models.IntegerField(default=0)
    missing_location = models.IntegerField(default=0)
    missing_temperature = models.IntegerField(default=0)
    missing_humidity = models.IntegerField(default=0)
    
    # Uptime metrics
    expected_uptime_minutes = models.IntegerField(default=0)
    actual_uptime_minutes = models.IntegerField(default=0)
    downtime_minutes = models.IntegerField(default=0)
    
    # Communication metrics
    successful_transmissions = models.IntegerField(default=0)
    failed_transmissions = models.IntegerField(default=0)
    avg_signal_strength = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Data completeness score (0-100)
    completeness_score = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Data quality report for {self.device.device_id} on {self.date}"
    
    class Meta:
        ordering = ['-date']
        unique_together = ['device', 'date']
        indexes = [
            models.Index(fields=['device', 'date']),
        ]
