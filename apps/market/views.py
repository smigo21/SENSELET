from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import Offer, PriceHistory
from .serializers import OfferSerializer, PriceHistorySerializer

class IsFarmerOrReadOnly(permissions.BasePermission):
    """
    Only users with role='farmer' can create or modify offers.
    Everyone can read.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return user.is_authenticated and getattr(user, "role", None) == "farmer"

class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.select_related("farmer", "product").all()
    serializer_class = OfferSerializer
    permission_classes = [IsFarmerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_prices(request):
    """Temporary mock prices — replace with DB or API later."""
    data = {
        "teff": {"price": 5800, "unit": "ETB/quintal"},
        "wheat": {"price": 4900, "unit": "ETB/quintal"},
        "coffee": {"price": 9800, "unit": "ETB/quintal"},
        "sorghum": {"price": 4500, "unit": "ETB/quintal"},
        "maize": {"price": 4200, "unit": "ETB/quintal"},
    }
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def price_history(request):
    """Get historical price data for analytics."""
    # Get last 30 days of data
    thirty_days_ago = timezone.now() - timedelta(days=30)

    # If no historical data exists, create some mock data
    if not PriceHistory.objects.exists():
        crops = ["Teff", "Wheat", "Coffee", "Sorghum", "Maize"]
        base_prices = [5500, 4300, 7800, 3100, 2700]

        for i in range(30):
            date = timezone.now() - timedelta(days=i)
            for crop, base_price in zip(crops, base_prices):
                # Add some variation
                variation = (i % 5 - 2) * 100  # -200 to +200 variation
                price = base_price + variation
                PriceHistory.objects.create(crop=crop, price=price, date=date)

    # Get data grouped by crop
    crops_data = {}
    for crop in ["Teff", "Wheat", "Coffee", "Sorghum", "Maize"]:
        history = PriceHistory.objects.filter(
            crop=crop,
            date__gte=thirty_days_ago
        ).order_by('date')

        crops_data[crop.lower()] = [
            {
                "date": item.date.strftime("%Y-%m-%d"),
                "price": float(item.price)
            }
            for item in history
        ]

    return Response(crops_data)
