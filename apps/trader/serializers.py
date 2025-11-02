from rest_framework import serializers
from .models import Order
from apps.market.serializers import OfferSerializer
from apps.market.models import Offer  # ✅ explicitly import Offer model


class OrderSerializer(serializers.ModelSerializer):
    trader = serializers.ReadOnlyField(source="trader.username")
    offer = OfferSerializer(read_only=True)
    offer_id = serializers.PrimaryKeyRelatedField(
        queryset=Offer.objects.all(),  # ✅ clearer than model lookup via _meta
        source="offer",
        write_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id", "trader", "offer", "offer_id",
            "quantity", "agreed_price", "status",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "trader", "created_at", "updated_at"]
