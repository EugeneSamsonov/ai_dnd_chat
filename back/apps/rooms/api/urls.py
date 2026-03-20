from django.urls import include, path

from rest_framework_nested import routers

from .views import RoomViewSet, ParticipantViewSet

router = routers.SimpleRouter()
router.register("", RoomViewSet, basename="rooms")

rooms_router = routers.NestedSimpleRouter(router, '', lookup='room')
rooms_router.register(r'participants', ParticipantViewSet, basename='room-participants')


urlpatterns = [
    path("", include(router.urls)),
    path('', include(rooms_router.urls)),
]