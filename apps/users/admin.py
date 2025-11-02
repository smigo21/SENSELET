from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Extra", {"fields": ("role", "phone", "region", "organization", "kyc_verified", "meta")}),
    )
    list_display = ("username", "email", "role", "region", "kyc_verified")
