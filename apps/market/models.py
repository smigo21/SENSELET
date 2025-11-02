from django.db import models
from django.conf import settings
from apps.crops.models import Product

class Offer(models.Model):
    """
    Offer posted by a farmer for a specific crop/product.
    """
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="offers")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="offers")
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    min_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name} ({self.quantity}) by {self.farmer.username}"

class PriceHistory(models.Model):
    """
    Historical price data for crops.
    """
    crop = models.CharField(max_length=100)  # e.g., 'Teff', 'Wheat'
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price in ETB per quintal
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.crop} - {self.price} ETB on {self.date}"
