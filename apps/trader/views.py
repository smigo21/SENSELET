from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer
from apps.logistics.models import TransportRoute
from apps.users.models import User  # ✅ for automatic driver assignment


class IsTraderOrReadOnly(permissions.BasePermission):
    """
    Only traders can create or modify orders.
    Farmers can update order status (accept/reject/complete).
    Everyone else can view.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return user.is_authenticated and getattr(user, "role", None) in ["trader", "farmer"]


class OrderViewSet(viewsets.ModelViewSet):
    """
    Handles trader order creation and farmer status updates.
    """
    queryset = Order.objects.select_related("trader", "offer", "offer__product").all()
    serializer_class = OrderSerializer
    permission_classes = [IsTraderOrReadOnly]

    def get_queryset(self):
        """Return orders filtered by user role."""
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()

        role = getattr(user, "role", None)
        if role == "trader":
            return Order.objects.filter(trader=user).select_related("offer", "offer__product")
        if role == "farmer":
            return Order.objects.filter(offer__farmer=user).select_related("offer", "offer__product")
        return Order.objects.all().select_related("offer", "offer__product")

    def perform_create(self, serializer):
        """Automatically assign trader to new order."""
        serializer.save(trader=self.request.user)

    @action(detail=True, methods=["patch"], url_path="set-status")
    def set_status(self, request, pk=None):
        """
        Allows the farmer to update the order status (accepted/rejected/completed).
        When accepted, a TransportRoute is automatically created with a QR code
        and a driver is auto-assigned if available.
        """
        order = self.get_object()
        user = request.user

        # ✅ Only the farmer who owns the offer can update the order
        if getattr(user, "role", None) != "farmer" or order.offer.farmer != user:
            return Response(
                {"detail": "Only the farmer who owns this offer can update the order status."},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get("status")
        if new_status not in ["accepted", "rejected", "completed"]:
            return Response(
                {"detail": "Invalid status. Must be accepted, rejected, or completed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Update order status
        order.status = new_status
        order.save()

        # ✅ Handle effects of each status
        offer = order.offer
        if new_status == "accepted":
            offer.quantity -= order.quantity
            if offer.quantity <= 0:
                offer.quantity = 0
                offer.active = False
            offer.save()

            # ✅ Auto-assign driver (first available)
            driver = User.objects.filter(role="driver").first()

            # ✅ Auto-create transport route
            route = TransportRoute.objects.create(
                driver=driver,
                order=order,
                pickup_point="Farmer Warehouse",
                destination="Trader Storage",
                distance_km=None,
            )
            route.generate_qr()
            route.save()

        elif new_status == "completed":
            # ✅ Mark any active transport routes as finished
            TransportRoute.objects.filter(order=order, is_active=True).update(is_active=False)

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
