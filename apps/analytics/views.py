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
    Government Dashboard API:
    - Summary stats (users, offers, orders, routes)
    - Active truck tracking for live map display
    """
    permission_classes = [IsAuthenticated]

    # --------------------------------------------------------------------------
    # 🧩 SUMMARY STATISTICS
    # --------------------------------------------------------------------------
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """
        Returns aggregated dashboard data:
        - User breakdown by role
        - Offer, Order, Active Route counts
        """
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

    # --------------------------------------------------------------------------
    # 🚛 ACTIVE TRUCK LOCATIONS (FOR MAP)
    # --------------------------------------------------------------------------
    @action(detail=False, methods=["get"], url_path="active-trucks")
    def active_trucks(self, request):
        """
        Returns the most recent truck locations per driver (for live tracking).
        Compatible with SQLite, PostgreSQL, and MySQL.
        """
        # Step 1: Get latest timestamp per driver
        latest_times = (
            VehicleLocation.objects
            .filter(driver__isnull=False)
            .values("driver")
            .annotate(latest_time=Max("timestamp"))
        )

        # Step 2: Fetch latest location record per driver
        recent_locations = VehicleLocation.objects.filter(
            driver__in=[r["driver"] for r in latest_times],
            timestamp__in=[r["latest_time"] for r in latest_times]
        ).select_related("driver", "route")

        # Step 3: Build clean data for frontend
        truck_data = [
            {
                "id": loc.id,
                "driver": loc.driver.username if loc.driver else "Unknown",
                "lat": float(loc.lat),
                "lng": float(loc.lng),
                "status": loc.status,
                "speed_kmh": float(loc.speed_kmh or 0),
                "timestamp": loc.timestamp,
                "route_id": loc.route.id if loc.route else None,
            }
            for loc in recent_locations
        ]

        return Response({"active_trucks": truck_data})
