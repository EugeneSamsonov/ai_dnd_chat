from rest_framework import serializers
from apps.game_core.models import Character, World

class CharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Character
        fields = "__all__"

class WorldSerializer(serializers.ModelSerializer):
    class Meta:
        model = World
        fields = "__all__"
