from rest_framework import serializers

from apps.game_core.api.serializers import CharacterSerializer

from ..models import Participant, Room


class ParticipantSerializer(serializers.ModelSerializer):
    is_ready = serializers.SerializerMethodField()
    character = CharacterSerializer(read_only=True)

    def get_is_ready(self, obj):
        return obj.room.ready_players.filter(id=obj.user.id).exists()

    class Meta:
        model = Participant
        fields = "__all__"
        read_only_fields = ["user", "room", "joined_at"]
        # read_only_fields = ["id", "user", "room", "role", "nickname", "joined_at"]


class CurrentParticipantSerializer(serializers.ModelSerializer):
    has_character = serializers.SerializerMethodField()

    class Meta:
        model = Participant
        fields = ("id", "role", "is_room_admin", "has_character")

    def get_has_character(self, obj):
        return hasattr(obj, "character") and obj.character is not None


class RoomSerializer(serializers.ModelSerializer):
    current_participant = serializers.SerializerMethodField()
    has_world = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = "__all__"
        read_only_fields = [
            "id",
            # "name",
            "creator",
            # "is_ai_dm",
            # "passcode",
            "status",
            "turn_count",
            "ready_players",
        ]
        extra_kwargs = {"id": {"read_only": True}, "passcode": {"write_only": True}}

    def get_current_participant(self, obj):
        # Достаем данные, которые мы сохранили в to_attr="current_participant"
        participants = getattr(obj, "current_participant", [])

        if not participants:
            return None

        participant = participants[0]

        return CurrentParticipantSerializer(participant).data
    
    def get_has_world(self, obj):
        return obj.world is not None


class RoomDetailSerializer(RoomSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)


class RoomJoinSerializer(serializers.ModelSerializer):
    passcode = serializers.CharField(required=False)

    class Meta:
        model = Room
        fields = ["passcode"]
