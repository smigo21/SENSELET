from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Max
from apps.market.models import Offer
from apps.trader.models import Order
from apps.logistics.models import TransportRoute, VehicleLocation

User = get_user_model()


class GovernmentDashboardViewSet(viewsets.ViewSet):
    """
    Returns high-level statistics for government dashboard:
    - Total users + breakdown by role
    - Total offers, orders, active routes
    - Active truck locations for live tracking
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        users = User.objects.all()
        total_users = users.count()

        data = {
            "users": {
                "total": total_users,
                "farmers": users.filter(role="farmer").count(),
                "traders": users.filter(role="trader").count(),
                "drivers": users.filter(role="driver").count(),
                "government": users.filter(role="government").count(),
            },
            "offers": Offer.objects.count(),
            "orders": Order.objects.count(),
            "active_routes": TransportRoute.objects.filter(is_active=True).count(),
        }
        return Response(data)

    @action(detail=False, methods=["get"], url_path="active-trucks")
    def active_trucks(self, request):
        """
        Returns the latest truck location per driver for map visualization.
        SQLite-safe (no DISTINCT ON).
        """
        # Step 1: Get each driver's latest timestamp
        latest_timestamps = (
            VehicleLocation.objects.values("driver_id")
            .annotate(latest_time=Max("timestamp"))
        )

        # Step 2: Retrieve the corresponding VehicleLocation entries
        recent_locations = VehicleLocation.objects.filter(
            timestamp__in=[item["latest_time"] for item in latest_timestamps]
        ).select_related("driver", "route")

        # Step 3: Format truck data
        truck_data = [
            {
                "id": loc.id,
                "driver": loc.driver.username if loc.driver else "Unknown",
                "lat": float(loc.lat),
                "lng": float(loc.lng),
                "status": loc.status,
                "speed_kmh": float(loc.speed_kmh or 0),
                "timestamp": loc.timestamp,
            }
            for loc in recent_locations
        ]

        return Response({"active_trucks": truck_data})
