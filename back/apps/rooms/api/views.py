from rest_framework import viewsets
from drf_spectacular.utils import extend_schema

from .serializers import ParticipantSerializer, RoomSerializer
from ..models import Participant, Room

@extend_schema(tags=['Игровые комнаты'])
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().prefetch_related("participants__user")
    serializer_class = RoomSerializer

@extend_schema(tags=['Игровые участники'])
class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all().prefetch_related("participants__user")
    serializer_class = ParticipantSerializer
