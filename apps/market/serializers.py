from rest_framework import serializers
from .models import Offer, PriceHistory
from apps.crops.serializers import ProductSerializer

class OfferSerializer(serializers.ModelSerializer):
    farmer = serializers.ReadOnlyField(source="farmer.username")
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Offer._meta.get_field("product").remote_field.model.objects.all(),
        source="product",
        write_only=True
    )

    class Meta:
        model = Offer
        fields = [
            "id", "farmer", "product", "product_id",
            "quantity", "min_price", "description",
            "active", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "farmer"]

class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = ["id", "crop", "price", "date"]
