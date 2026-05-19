from django.db import models

class World(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    # Простое поле для мастера, чтобы набросать основные правила или лор
    history = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Character(models.Model):
    # Прямая связь: один участник — один персонаж
    participant = models.OneToOneField(
        'rooms.Participant', 
        on_delete=models.CASCADE, 
        related_name='character'
    )
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    
    # MVP статы (самый стандарт)
    hp = models.IntegerField(default=100)
    level = models.PositiveIntegerField(default=1)
    
    # Чтобы было что на фронте крутить
    strength = models.IntegerField(default=10)
    agility = models.IntegerField(default=10)
    intelligence = models.IntegerField(default=10)

    inventory = models.TextField(blank=True, null=True)


    def __str__(self):
        return self.name 
    
    def to_ai_representation(self):
        return str(
            {
                "name": self.name,
                "hp": self.hp,
                "level": self.level,
                "strength": self.strength,
                "agility": self.agility,
                "intelligence": self.intelligence,
                "inventory": self.inventory,
            }
        )