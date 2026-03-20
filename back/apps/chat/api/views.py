from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema

from apps.rooms.models import Participant, Room

from .serializers import MessageSerializer
from ..models import Message


@extend_schema(tags=['Игровой чат'])
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        room = get_object_or_404(Room, id=self.request.query_params.get("room"))

        qs = (
            Message.objects.filter(room=room)
            .order_by("timestamp")
            .select_related("sender")
        )

        if Participant.objects.filter(user=self.request.user, room=room).exists():
            return (
                qs.filter(chat_type=self.request.query_params.get("chat_type"))
                if self.request.query_params.get("chat_type")
                else qs
            )
        else:
            raise PermissionDenied()

    def perform_create(self, serializer):
        if serializer.validated_data.get("chat_type") == "GAME":
            room = get_object_or_404(Room, id=serializer.validated_data.get("room"))
            participant = Participant.objects.filter(user=self.request.user, room=room)

            if room.status == "DM_TURN" and participant.role != "DM":
                raise ValidationError({"error": "Сейчас ход Мастера!"})

            if self.request.user in room.ready_players.all():
                raise ValidationError({"error": "Вы уже сделали свой ход!"})

            room.ready_players.add(self.request.user)

            serializer.save(sender=self.request.user, turn_number=room.turn_count)

        else:
            serializer.save(sender=self.request.user)