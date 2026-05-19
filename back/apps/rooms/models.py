import uuid
from django.db import models
from django.db import transaction
from django.conf import settings


class Room(models.Model):
    STATUS_CHOICES = [
        ("DM_TURN", "Ход Мастера"),
        ("PLAYERS_TURN", "Ход Игроков"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(verbose_name="Название комнаты", max_length=255)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_rooms"
    )

    is_ai_dm = models.BooleanField(verbose_name="ИИ в роли ДМа", default=True)
    passcode = models.CharField(
        verbose_name="Пароль", max_length=128, blank=True, null=True
    )

    turn_status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="DM_TURN"
    )
    turn_count = models.PositiveIntegerField(
        verbose_name="Номер текущего хода", default=1
    )

    # Список игроков, которые УЖЕ написали сообщение в ТЕКУЩЕМ ходу
    # Очищается, когда ход переходит к ДМу
    ready_players = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name="ready_in_turns"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    # game_core
    world = models.ForeignKey(
        "game_core.World",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        default=None,
    )

    def __str__(self):
        return f"{self.name} ({self.id})"

    def check_and_switch_turn(self):
        with transaction.atomic():
            # Блокируем строку комнаты в базе до конца транзакции
            room = Room.objects.select_for_update().get(pk=self.pk)

            active_players = room.participants.filter(
                role="PLAYER",
                character__hp__gt=0,  # Живой?
                can_move=True,
                is_banned=False,
            )

            active_count = active_players.count()
            ready_count = room.ready_players.count()

            if room.turn_status == "DM_TURN":
                if active_count > 0:
                    room.turn_status = "PLAYERS_TURN"
                room.save()
                return


            if ready_count >= active_count:
                room.turn_count += 1
                room.turn_status = "DM_TURN"
                room.ready_players.clear()
                room.save()


class Participant(models.Model):
    ROLE_CHOICES = [
        ("PLAYER", "Игрок"),
        ("SPECTATOR", "Наблюдатель"),
        ("DM", "ДМ"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    room = models.ForeignKey(
        Room, on_delete=models.CASCADE, related_name="participants"
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="PLAYER")

    # Имя персонажа для игрового чата (чтобы не светить username и для оптимизации чата)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    is_room_admin = models.BooleanField(default=False)

    # Для игрового чата
    can_move = models.BooleanField(default=True)

    is_banned = models.BooleanField(default=False)

    class Meta:
        unique_together = ("user", "room")  # Защита от дублей в одной комнате

    def __str__(self):
        return f"{self.id} {self.user.username} ({self.room.name})"
