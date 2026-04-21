from rest_framework import serializers
from django.contrib.auth.models import User

from apps.rooms.api.serializers import ParticipantSerializer

from ..models import Message


class SenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username"]  # , "first_name", "last_name", "email"]
        read_only_fields = ["username"]  # , "first_name", "last_name", "email"]


class MessageSerializer(serializers.ModelSerializer):
    sender = SenderSerializer(read_only=True)
    participant = ParticipantSerializer(read_only=True)

    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = [
            "id",
            "room",
            "sender",
            # "text",
            # "chat_type",
            "turn_number",
            "is_ai",
            "timestamp",
        ]
