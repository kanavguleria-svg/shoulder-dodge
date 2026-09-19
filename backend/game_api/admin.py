from django.contrib import admin
from .models import GameScore, GameConfig, SiteMetricSession

@admin.register(GameScore)
class GameScoreAdmin(admin.ModelAdmin):
    list_display = ('player_name', 'score', 'level', 'created_at')
    list_filter = ('level', 'created_at')
    search_fields = ('player_name',)


@admin.register(GameConfig)
class GameConfigAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'speed_base', 'base_interval', 'lives_max', 'updated_at')


@admin.register(SiteMetricSession)
class SiteMetricSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'retries', 'time_spent_seconds', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('session_id',)

