from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "category_id", "unit", "active", "description", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]
