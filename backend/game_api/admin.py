from django.contrib import admin
from .models import GameScore, GameConfig

@admin.register(GameScore)
class GameScoreAdmin(admin.ModelAdmin):
    list_display = ('player_name', 'score', 'level', 'created_at')
    list_filter = ('level', 'created_at')
    search_fields = ('player_name',)


@admin.register(GameConfig)
class GameConfigAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'speed_base', 'base_interval', 'lives_max', 'updated_at')
