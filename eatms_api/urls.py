from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("apps.users.urls")),
    path("api/crops/", include("apps.crops.urls")),
    path("api/market/", include("apps.market.urls")),
    path("api/trader/", include("apps.trader.urls")),
    path("api/logistics/", include("apps.logistics.urls")),
    path("api/government/", include("apps.government.urls")),
    path("api/government/", include("apps.analytics.urls")),
    path("api/token/", include("apps.users.token_urls")),
    path("api/market/", include("apps.market.urls")),




    # ✅ Add these JWT auth routes
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
