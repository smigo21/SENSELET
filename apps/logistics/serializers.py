from rest_framework import serializers
from .models import TransportRoute, VehicleLocation
from apps.trader.serializers import OrderSerializer


class TransportRouteSerializer(serializers.ModelSerializer):
    """
    Serializer for Transport Routes.
    Includes nested Order info (read-only) and driver username.
    """
    driver = serializers.ReadOnlyField(source="driver.username")
    order = OrderSerializer(read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(
        source="order",
        queryset=TransportRoute._meta.get_field("order").remote_field.model.objects.all(),
        write_only=True
    )
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = TransportRoute
        fields = [
            "id",
            "driver",
            "order",
            "order_id",
            "pickup_point",
            "destination",
            "distance_km",
            "qr_code_url",
            "is_active",
            "started_at",
            "finished_at",
        ]
        read_only_fields = ["id", "driver", "qr_code_url", "started_at", "finished_at"]

    def get_qr_code_url(self, obj):
        """Return full URL for QR code if it exists."""
        request = self.context.get("request")
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None


class VehicleLocationSerializer(serializers.ModelSerializer):
    """
    Serializer for Vehicle Location updates.
    Used by drivers to post GPS coordinates.
    """
    driver = serializers.ReadOnlyField(source="driver.username")

    class Meta:
        model = VehicleLocation
        fields = [
            "id",
            "route",
            "driver",
            "lat",
            "lng",
            "speed_kmh",
            "status",
            "timestamp",
        ]
        read_only_fields = ["id", "driver", "timestamp"]
