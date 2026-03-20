from rest_framework import serializers

from ..models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = [
            "id",
            "room",
            "sender",
            "text",
            "chat_type",
            "turn_number",
            "is_ai",
            "timestamp",
        ]
