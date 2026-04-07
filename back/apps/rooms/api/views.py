from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError

from .serializers import ParticipantSerializer, RoomSerializer
from ..models import Participant, Room
from .permissions import IsRoomAdmin


@extend_schema(tags=["Игровые комнаты"])
class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [
        IsAuthenticated,
        IsRoomAdmin,
    ]

    def get_queryset(self):
        return (
            Room.objects.filter(participants__user=self.request.user)
            .prefetch_related("participants__user")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        with transaction.atomic():
            room = serializer.save(creator=self.request.user)

            Participant.objects.create(
                user=self.request.user,
                room=room,
                is_room_admin=True,
                nickname=self.request.user.username,
            )


@extend_schema(tags=["Игровые участники"])
class ParticipantViewSet(viewsets.ModelViewSet):
    serializer_class = ParticipantSerializer
    permission_classes = [
        IsAuthenticated,
        IsRoomAdmin,
    ]

    def get_queryset(self):
        room = get_object_or_404(Room, id=self.kwargs.get("room_pk"))
        return Participant.objects.filter(room=room).order_by("-joined_at")


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user == instance.room.creator:
            raise ValidationError({"error": "Нельзя удалить создателя комнаты"})
        
        return super().destroy(request, *args, **kwargs)