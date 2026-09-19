import json

def parse_json_body(request):
    """Safely parse JSON from a request body."""
    try:
        return json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError, AttributeError):
        return None

def format_score(score_obj):
    """Format a GameScore instance into a dictionary."""
    return {
        'id': score_obj.id,
        'player_name': score_obj.player_name,
        'score': score_obj.score,
        'level': score_obj.level,
        'created_at': score_obj.created_at.isoformat(),
    }

def format_config(config_obj):
    """Format a GameConfig instance into a dictionary."""
    return {
        'name': config_obj.name,
        'canvas_w': config_obj.canvas_w,
        'canvas_h': config_obj.canvas_h,
        'shoulder_radius': config_obj.shoulder_radius,
        'bullet_radius': config_obj.bullet_radius,
        'base_interval': config_obj.base_interval,
        'speed_base': config_obj.speed_base,
        'lives_max': config_obj.lives_max,
    }


def format_duration(seconds):
    """Format duration in seconds to a human-readable string."""
    seconds = int(round(seconds))
    mins, secs = divmod(seconds, 60)
    hours, mins = divmod(mins, 60)
    if hours > 0:
        return f"{hours}h {mins}m {secs}s"
    elif mins > 0:
        return f"{mins}m {secs}s"
    else:
        return f"{secs}s"


