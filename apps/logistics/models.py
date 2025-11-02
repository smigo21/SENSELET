import qrcode
import io
from django.db import models
from django.conf import settings
from django.core.files.base import ContentFile
from django.utils import timezone
from apps.trader.models import Order


class TransportRoute(models.Model):
    """
    Represents a transport route created when an order is accepted.
    Each route is linked to an order and optionally a driver.
    A QR code is generated for verification and tracking.
    """
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="routes",
        null=True,
        blank=True
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="routes"
    )
    pickup_point = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    distance_km = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    qr_code = models.ImageField(upload_to="qrcodes/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        driver_name = self.driver.username if self.driver else "Unassigned"
        return f"Route #{self.id} | Driver: {driver_name}"

    def generate_qr(self):
        """
        Generates and attaches a QR code that contains route/order/driver info.
        Can be used for roadside or warehouse verification.
        """
        driver_info = self.driver.username if self.driver else "None"
        qr_data = f"ROUTE_ID:{self.id}|ORDER_ID:{self.order.id}|DRIVER:{driver_info}"
        qr_img = qrcode.make(qr_data)

        buffer = io.BytesIO()
        qr_img.save(buffer, format="PNG")
        file_name = f"route_{self.id}.png"
        self.qr_code.save(file_name, ContentFile(buffer.getvalue()), save=False)
        buffer.close()
        return self.qr_code

    def complete_route(self):
        """Mark route as finished and deactivate tracking."""
        self.is_active = False
        self.finished_at = timezone.now()
        self.save(update_fields=["is_active", "finished_at"])


class VehicleLocation(models.Model):
    """
    Real-time truck GPS pings.
    Drivers (via app/device) post latitude/longitude & speed regularly.
    Used in dashboards for route tracking and logistics visibility.
    """
    STATUS_CHOICES = [
        ("moving", "Moving"),
        ("stopped", "Stopped"),
        ("idle", "Idle"),
        ("offline", "Offline"),
    ]

    route = models.ForeignKey(
        TransportRoute,
        on_delete=models.CASCADE,
        related_name="locations"
    )
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vehicle_locations"
    )
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    speed_kmh = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="moving")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["route", "-timestamp"]),
            models.Index(fields=["driver", "-timestamp"]),
        ]

    def __str__(self):
        driver_name = self.driver.username if self.driver else "Unknown"
        return f"Loc(route={self.route_id}, driver={driver_name}, {self.lat},{self.lng} @ {self.timestamp:%Y-%m-%d %H:%M:%S})"

    @property
    def coordinates(self):
        """Helper for map rendering."""
        return float(self.lat), float(self.lng)
