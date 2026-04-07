from rest_framework import permissions

from apps.rooms.models import Participant


class IsRoomAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if isinstance(obj, Participant):
            obj = obj.room

        if request.method == "DELETE":
            return obj.creator == request.user

        return Participant.objects.filter(
            user=request.user, room=obj, is_room_admin=True
        ).exists()
