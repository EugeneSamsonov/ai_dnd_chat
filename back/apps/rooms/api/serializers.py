from rest_framework import serializers

from ..models import Participant, Room


class ParticipantSerializer(serializers.ModelSerializer):
    is_ready = serializers.SerializerMethodField()

    def get_is_ready(self, obj):
        return obj.room.ready_players.filter(id=obj.user.id).exists()

    class Meta:
        model = Participant
        fields = "__all__"
        read_only_fields = ["id", "user", "room", "role", "nickname", "joined_at"]


class RoomSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)
    creator = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Room
        fields = "__all__"
        read_only_fields = [
            "id",
            "name",
            "creator",
            "is_ai_dm",
            # "passcode",
            "status",
            "turn_count",
            "ready_players",
        ]
        extra_kwargs = {"id": {"read_only": True}, "passcode": {"write_only": True}}
