from calendar import c

from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_spectacular.utils import extend_schema

from apps.game_core.models import Character
from apps.rooms.models import Participant, Room

from .serializers import MessageSerializer
from ..models import Message
from .ai_servises import OllamaService


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

        if not Participant.objects.filter(
            user=self.request.user, room__id=room_id
        ).exists():
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
            serializer.save(
                sender=self.request.user, room=room, participant=participant
            )
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
                sender=self.request.user,
                turn_number=room.turn_count,
                room=room,
                participant=participant,
            )
            room.check_and_switch_turn()
        else:
            raise ValidationError({"error": "Неверный тип чата!"})

    @action(detail=False, methods=["post"], url_path="ask-ai")
    def ask_ai(self, request):
        room_id = request.query_params.get("room")
        room = get_object_or_404(Room, id=room_id)

        current_participant = (
            Participant.objects.filter(room=room, user=request.user)
            .select_related("character")
            .first()
        )
        if not current_participant:
            raise ValidationError({"error": "Вы не участник комнаты"})

        promt = request.data.get("promt")
        with_context = request.data.get("withContext")

        if not with_context or with_context == "false":
            suggestion = OllamaService.generate_suggestion(promt)
            return Response({"suggestion": suggestion})

        # Получаем сообщения за 10 последних ходов вместе с их персонажами
        min_turn = max(0, room.turn_count - 9)
        messages = (
            Message.objects.filter(room=room, turn_number__gte=min_turn)
            .select_related("sender")
            .prefetch_related("sender__participant_set__character")
            .order_by("turn_number", "timestamp")
        )

        # Получаем информацию о персонажах без лишнего запроса в БД
        unique_characters = {}
        for m in messages:
            participant = getattr(m.sender, "participant", None)
            character = getattr(participant, "character", None) if participant else None

            if character and character.id not in unique_characters:
                unique_characters[character.id] = character

        characters_context = "\n".join(
            [char.to_ai_representation() for char in unique_characters.values()]
        )

        if hasattr(current_participant, "character") and current_participant.character is not None:
            char_name = current_participant.character.name
        else:
            # Если персонажа нет, выводим никнейм или username пользователя
            char_name = current_participant.nickname

        current_participant_context = (
            f"Роль: {current_participant.role}, "
            f"Имя в игре: {char_name}, "
            f"Может ходить: {current_participant.can_move}"
        )

        context_text = f"Текущий пользователь: {current_participant_context}\n\n\
        Информация о персонажах:\n{characters_context}\n\n \
        Сообщения за последние 10 ходов:{"\n".join(
            [
                m.to_ai_representation()
                for m in messages
            ]
        )}"

        suggestion = OllamaService.generate_suggestion(promt, context_text)
        return Response({"suggestion": suggestion})
