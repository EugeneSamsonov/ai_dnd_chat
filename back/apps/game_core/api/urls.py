from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import WorldViewSet, CharacterViewSet

world_router = DefaultRouter()
world_router.register("worlds", WorldViewSet, basename="worlds")

characters_router = DefaultRouter()
characters_router.register("characters", CharacterViewSet, basename="characters")


urlpatterns = [
    path('', include(world_router.urls)),
    path('', include(characters_router.urls)),
]