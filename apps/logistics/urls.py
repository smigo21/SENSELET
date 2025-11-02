from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransportRouteViewSet, VehicleLocationViewSet, ActiveTrucksView

router = DefaultRouter()
router.register(r"routes", TransportRouteViewSet, basename="route")
router.register(r"locations", VehicleLocationViewSet, basename="location")

urlpatterns = [
    path("", include(router.urls)),
    path("active-trucks/", ActiveTrucksView.as_view(), name="active-trucks"),
]
