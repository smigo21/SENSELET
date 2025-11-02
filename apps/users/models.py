from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    ROLE_FARMER = "farmer"
    ROLE_TRADER = "trader"
    ROLE_TRANSPORTER = "transporter"
    ROLE_GOV = "gov"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = [
        (ROLE_FARMER, "Farmer"),
        (ROLE_TRADER, "Trader"),
        (ROLE_TRANSPORTER, "Transporter"),
        (ROLE_GOV, "Government"),
        (ROLE_ADMIN, "Admin"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default=ROLE_FARMER)
    phone = models.CharField(max_length=32, blank=True, null=True, db_index=True)
    organization = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=128, blank=True, null=True)
    kyc_verified = models.BooleanField(default=False)
    meta = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
