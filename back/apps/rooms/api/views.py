from django.shortcuts import get_object_or_404
from django.db import transaction
from drf_spectacular.utils import extend_schema
from django.db.models import Prefetch
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    ParticipantSerializer,
    RoomDetailSerializer,
    RoomJoinSerializer,
    RoomSerializer,
)
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
        if self.action == "join":
            return Room.objects.all()

        queryset = Room.objects.filter(participants__user=self.request.user).order_by(
            "-created_at"
        )

        return queryset.prefetch_related(
            Prefetch(
                "participants",
                queryset=Participant.objects.filter(user=self.request.user),
                to_attr="current_participant",
            )
        )

    def get_serializer_class(self):
        # Если действие - просмотр одного объекта (retrieve)
        if self.action == "retrieve":
            return RoomDetailSerializer
        # Для остальных действий (list, create, update, destroy)
        return RoomSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            room = serializer.save(creator=self.request.user)

            Participant.objects.create(
                user=self.request.user,
                room=room,
                is_room_admin=True,
                nickname=self.request.user.username,
            )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user != instance.creator:
            raise ValidationError(
                {"error": "Удалить комнату может только ее создатель"}
            )
        return super().destroy(instance)

    @extend_schema(
        request=RoomJoinSerializer, responses={201: None}, tags=["Игровые комнаты"]
    )
    @action(methods=["post"], detail=True, permission_classes=[IsAuthenticated])
    def join(self, request, *args, **kwargs):
        serializer = RoomJoinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        room = self.get_object()

        if Participant.objects.filter(user=request.user, room=room).exists():
            raise ValidationError({"error": "Вы уже в этой комнате"})

        if room.passcode and room.passcode != request.data.get("passcode"):
            raise ValidationError({"error": "Неверный пароль"})

        Participant.objects.create(
            user=request.user, room=room, nickname=request.user.username
        )

        return Response(
            {"detail": "Вы успешно присоединились к комнате"},
            status=status.HTTP_201_CREATED,
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
            raise ValidationError({"error": "Нельзя выгнать создателя комнаты"})

        return super().destroy(request, *args, **kwargs)
