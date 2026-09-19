from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('leaderboard/', views.leaderboard_view, name='leaderboard'),
    path('scores/', views.submit_score_view, name='submit_score'),
    path('config/', views.game_config_view, name='game_config'),
]

