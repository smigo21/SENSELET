from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import OfferViewSet, market_prices, price_history

router = DefaultRouter()
router.register(r"offers", OfferViewSet, basename="offer")

urlpatterns = [
    path("", include(router.urls)),
    path("prices/", market_prices, name="market_prices"),
    path("price-history/", price_history, name="price_history"),
]
