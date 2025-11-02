from rest_framework import permissions

class IsRole(permissions.BasePermission):
    """
    Allow access only to users with a specific role or any of several roles.

    Usage:
      permission_classes = [IsRole('farmer')]
      permission_classes = [IsRole('trader', 'gov')]
    """
    def __init__(self, *allowed_roles):
        # allowed_roles can be strings ('farmer') or empty (no restriction)
        self.allowed_roles = set(allowed_roles)

    def has_permission(self, request, view):
        # If no roles supplied, default to authenticated-only behavior
        if not self.allowed_roles:
            return bool(request.user and request.user.is_authenticated)

        # If no user or not authenticated -> deny
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False

        # user.role must exist on your custom User model
        return user.role in self.allowed_roles

    # DRF instantiates permission classes without args by default. To support
    # passing args in class attribute, we provide a classmethod helper:
    @classmethod
    def for_roles(cls, *roles):
        return cls(*roles)
