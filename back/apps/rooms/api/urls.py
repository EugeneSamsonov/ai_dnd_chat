from django.urls import include, path

from rest_framework_nested import routers

from .views import RoomViewSet, ParticipantViewSet

rooms_router = routers.SimpleRouter()
rooms_router.register("", RoomViewSet, basename="rooms")

participants_router = routers.NestedSimpleRouter(rooms_router, '', lookup='room')
participants_router.register(r'participants', ParticipantViewSet, basename='room-participants')


urlpatterns = [
    path("", include(rooms_router.urls)),
    path('', include(participants_router.urls)),
]