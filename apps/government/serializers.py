from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.market.models import Offer
from apps.trader.models import Order
from apps.logistics.models import TransportRoute, VehicleLocation
from apps.crops.models import Product  # ✅ use Product, not Crop

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "region", "is_active"]


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"


class RouteSerializer(serializers.ModelSerializer):
    driver_username = serializers.CharField(source="driver.username", read_only=True)
    order_id = serializers.IntegerField(source="order.id", read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = TransportRoute
        fields = [
            "id", "driver_username", "order_id", "pickup_point", "destination",
            "distance_km", "is_active", "started_at", "finished_at", "qr_code_url"
        ]

    def get_qr_code_url(self, obj):
        request = self.context.get("request")
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None


# ✅ Renamed CropSerializer → ProductSerializer
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class VehicleLocationSerializer(serializers.ModelSerializer):
    driver = serializers.CharField(source="driver.username", read_only=True)

    class Meta:
        model = VehicleLocation
        fields = ["id", "route", "driver", "lat", "lng", "speed_kmh", "status", "timestamp"]
