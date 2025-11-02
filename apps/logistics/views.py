from datetime import timedelta
from django.utils.timezone import now
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import TransportRoute, VehicleLocation
from .serializers import TransportRouteSerializer, VehicleLocationSerializer


class IsDriverOrReadOnly(permissions.BasePermission):
    """
    Drivers can update their own routes and post location updates.
    Farmers/Traders/Government can only view data.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return user.is_authenticated and getattr(user, "role", None) == "driver"

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, "driver"):
            return obj.driver == request.user
        return False


class TransportRouteViewSet(viewsets.ModelViewSet):
    """
    Handles route visibility, driver actions, and completion updates.
    """
    queryset = TransportRoute.objects.select_related(
        "driver", "order", "order__offer", "order__offer__product"
    )
    serializer_class = TransportRouteSerializer
    permission_classes = [IsDriverOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return TransportRoute.objects.none()

        role = getattr(user, "role", None)
        if role == "driver":
            return TransportRoute.objects.filter(driver=user)
        if role == "farmer":
            return TransportRoute.objects.filter(order__offer__farmer=user)
        if role == "trader":
            return TransportRoute.objects.filter(order__trader=user)
        return TransportRoute.objects.all()

    @action(detail=True, methods=["patch"], url_path="finish")
    def finish_route(self, request, pk=None):
        """
        Allows the assigned driver to mark the route as completed.
        """
        route = self.get_object()
        user = request.user

        if getattr(user, "role", None) != "driver" or route.driver != user:
            return Response(
                {"detail": "Only the assigned driver can complete this route."},
                status=status.HTTP_403_FORBIDDEN
            )

        if not route.is_active:
            return Response(
                {"detail": "This route is already completed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        route.is_active = False
        route.save(update_fields=["is_active"])

        order = route.order
        if order.status != "completed":
            order.status = "completed"
            order.save(update_fields=["status"])

        return Response(
            {"detail": f"Route #{route.id} marked as completed."},
            status=status.HTTP_200_OK
        )


class VehicleLocationViewSet(viewsets.ModelViewSet):
    """
    Handles real-time location updates for trucks.
    Drivers send GPS updates (lat/lng/speed/status).
    Government/Admin can view all.
    """
    queryset = VehicleLocation.objects.select_related("route", "driver")
    serializer_class = VehicleLocationSerializer
    permission_classes = [IsDriverOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(driver=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return VehicleLocation.objects.none()

        role = getattr(user, "role", None)
        if role == "driver":
            return VehicleLocation.objects.filter(driver=user)
        return VehicleLocation.objects.all()

    @action(detail=False, methods=["get"], url_path="active")
    def active_locations(self, request):
        """
        Returns the most recent location for each active truck (for dashboards).
        """
        recent_cutoff = now() - timedelta(minutes=30)
        latest_locations = (
            VehicleLocation.objects
            .filter(timestamp__gte=recent_cutoff)
            .order_by("driver", "-timestamp")
            .distinct("driver")
        )
        serializer = self.get_serializer(latest_locations, many=True)
        return Response(serializer.data)


class ActiveTrucksView(APIView):
    """
    Returns latest location for each driver (for the government/trader dashboard map).
    """
    def get(self, request):
        recent_cutoff = now() - timedelta(minutes=30)
        latest_locations = (
            VehicleLocation.objects
            .filter(timestamp__gte=recent_cutoff)
            .select_related("driver", "route")
            .order_by("driver", "-timestamp")
            .distinct("driver")
        )
        serializer = VehicleLocationSerializer(latest_locations, many=True)
        return Response(serializer.data)
# --- Simulation: auto-update driver locations for testing ---

import threading, random, time
from django.utils.timezone import now

def simulate_driver_movement():
    """
    Simulates driver movement by randomly updating lat/lng every few seconds.
    """
    from .models import VehicleLocation
    from django.db import transaction

    print("🚚 Starting simulated driver movement...")

    while True:
        try:
            with transaction.atomic():
                locations = VehicleLocation.objects.select_related("driver").all()
                for loc in locations:
                    loc.lat += random.uniform(-0.01, 0.01)
                    loc.lng += random.uniform(-0.01, 0.01)
                    loc.speed_kmh = random.randint(20, 80)
                    loc.timestamp = now()
                    loc.save(update_fields=["lat", "lng", "speed_kmh", "timestamp"])
        except Exception as e:
            print("⚠️ Simulation error:", e)
        time.sleep(10)  # update every 10 seconds
