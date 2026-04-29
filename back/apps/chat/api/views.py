from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination

from drf_spectacular.utils import extend_schema

from apps.rooms.models import Participant, Room

from .serializers import MessageSerializer
from ..models import Message


class ChatMessagePagination(LimitOffsetPagination):
    default_limit = 50  # Сколько сообщений грузить по умолчанию
    max_limit = 100


@extend_schema(tags=["Игровой чат"])
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ChatMessagePagination

    def get_queryset(self):
        room_id = self.request.query_params.get("room")
        chat_type = self.request.query_params.get("chatType")

        with_participants = self.request.query_params.get("withParticipants")
        with_participants_and_characters = self.request.query_params.get(
            "withParticipantsAndCharacters"
        )

        if not Participant.objects.filter(user=self.request.user, room__id=room_id).exists():
            raise PermissionDenied("Вы не участник этой комнаты")

        if not room_id:
            raise ValidationError(
                {"detail": "Не указан ID комнаты (параметр ?room=...)"}
            )

        room = get_object_or_404(Room, id=room_id)

        qs = Message.objects.filter(room=room).order_by("-timestamp")

        if with_participants == "true":
            qs = qs.select_related("sender", "participant")

        elif with_participants_and_characters == "true":
            qs = qs.select_related("sender", "participant", "participant__character")

        else:
            qs = qs.select_related("sender")

        return qs.filter(chat_type=chat_type) if chat_type else qs

    def perform_create(self, serializer):
        room_id = self.request.query_params.get("room")

        if not room_id:
            raise ValidationError(
                {"detail": "Не указан ID комнаты (параметр ?room=...)"}
            )

        room = get_object_or_404(Room, id=room_id)

        participant = Participant.objects.filter(
            user=self.request.user, room=room
        ).first()
        if not participant:
            raise PermissionDenied("Вы не участник этой комнаты")

        if serializer.validated_data.get("chat_type") == "OOC":
            serializer.save(sender=self.request.user, room=room, participant=participant)
            return

        elif serializer.validated_data.get("chat_type") == "GAME":
            if not participant.can_move or participant.role == "SPECTATOR":
                raise ValidationError({"error": "Вы не можете ходить!"})

            if room.turn_status == "DM_TURN" and participant.role != "DM":
                raise ValidationError({"error": "Сейчас ход Мастера!"})

            if room.turn_status == "PLAYERS_TURN":
                if participant.role != "PLAYER":
                    raise ValidationError({"error": "Сейчас ход игроков!"})

                if room.ready_players.filter(id=self.request.user.id).exists():
                    raise ValidationError({"error": "Вы уже сделали свой ход!"})
                
                if participant.character.hp <= 0:
                    raise ValidationError({"error": "Вы умерли и не можете ходить!"})

                room.ready_players.add(self.request.user)

            serializer.save(
                sender=self.request.user, turn_number=room.turn_count, room=room, participant=participant
            )
            room.check_and_switch_turn()
        else:
            raise ValidationError({"error": "Неверный тип чата!"})
