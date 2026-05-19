from django.db import models
from django.conf import settings
from apps.rooms.models import Room


class Message(models.Model):
    CHAT_TYPES = [
        ("GAME", "Игровой чат"),
        ("OOC", "Обсуждение (Out of Character)"),
    ]

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    participant = models.ForeignKey(
        'rooms.Participant', 
        on_delete=models.SET_NULL, 
        related_name='messages',
        null=True
    )

    text = models.TextField(verbose_name="Текст сообщения")
    chat_type = models.CharField(max_length=10, choices=CHAT_TYPES, default="GAME")

    # Поля для игровой логики
    # Для OOC сообщений turn_number может быть null
    turn_number = models.PositiveIntegerField(null=True, blank=True)
    is_ai = models.BooleanField(default=False)  # Флаг ответа нейронки

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]  # Чтобы чат всегда шел по порядку времени

    def __str__(self):
        prefix = (
            "AI" if self.is_ai else (self.sender.username if self.sender else "System")
        )
        return f"[{self.chat_type}] {prefix}: {self.text[:30]}"


    def to_ai_representation(self):
        try:
            sender_name = self.sender.participant.character.name
        except AttributeError:
            sender_name = self.sender

        return str(
            {
                "sender": sender_name,
                "text": self.text,
                "turn_number": self.turn_number,
            }
        )