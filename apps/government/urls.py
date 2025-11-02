from rest_framework.routers import DefaultRouter
from .views import GovernmentDashboardViewSet

router = DefaultRouter()
router.register(r"dashboard", GovernmentDashboardViewSet, basename="government-dashboard")

urlpatterns = router.urls
