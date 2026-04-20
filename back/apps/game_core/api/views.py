from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

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
