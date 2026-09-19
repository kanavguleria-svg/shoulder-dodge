from django.db import models

class GameScore(models.Model):
    player_name = models.CharField(max_length=50, default='Anonymous')
    score = models.PositiveIntegerField()
    level = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', '-created_at']

    def __str__(self):
        return f"{self.player_name}: {self.score} (Lvl {self.level})"


class GameConfig(models.Model):
    name = models.CharField(max_length=50, default='Default', unique=True)
    canvas_w = models.PositiveIntegerField(default=560)
    canvas_h = models.PositiveIntegerField(default=480)
    shoulder_radius = models.PositiveIntegerField(default=22)
    bullet_radius = models.PositiveIntegerField(default=9)
    base_interval = models.PositiveIntegerField(default=1200)  # ms between bullets
    speed_base = models.FloatField(default=4.0)               # px/frame
    lives_max = models.PositiveIntegerField(default=3)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Config: {self.name} (Active: {self.is_active})"
