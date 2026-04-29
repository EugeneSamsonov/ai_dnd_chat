from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.rooms.models import Room

from .serializers import CharacterSerializer, WorldSerializer
from ..models import Character, World


@extend_schema(tags=["Игровые миры"])
class WorldViewSet(viewsets.ModelViewSet):
    serializer_class = WorldSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    queryset = World.objects.all()


@extend_schema(tags=["Игровые персонажи"])
class CharacterViewSet(viewsets.ModelViewSet):
    serializer_class = CharacterSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    queryset = Character.objects.all()

    def perform_update(self, serializer):
        room = Room.objects.filter(participants__user=self.request.user).first()
        if room.turn_status != "DM_TURN":
            raise ValidationError({"error": "Изменять персонажа можно только во время хода Мастера!"})
        serializer.save(user=self.request.user)
