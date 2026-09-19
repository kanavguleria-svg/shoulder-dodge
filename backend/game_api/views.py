from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import GameScore, GameConfig
from .utils import parse_json_body, format_score, format_config

@require_http_methods(["GET"])
def health_check(request):
    """Sanity check endpoint for verifying backend connectivity."""
    return JsonResponse({
        'status': 'healthy',
        'message': 'Shoulder Dodge Django Backend is running smoothly',
        'version': '1.0.0'
    })


@require_http_methods(["GET"])
def leaderboard_view(request):
    """Returns the top 10 highest scores."""
    scores = GameScore.objects.all()[:10]
    return JsonResponse({
        'status': 'success',
        'leaderboard': [format_score(s) for s in scores]
    })


@csrf_exempt
@require_http_methods(["POST"])
def submit_score_view(request):
    """Records a new game score."""
    data = parse_json_body(request)
    if not data:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON body'}, status=400)

    player_name = str(data.get('player_name', 'Anonymous')).strip()[:50] or 'Anonymous'
    try:
        score = int(data.get('score', 0))
        level = int(data.get('level', 1))
    except (ValueError, TypeError):
        return JsonResponse({'status': 'error', 'message': 'Score and level must be integers'}, status=400)

    record = GameScore.objects.create(
        player_name=player_name,
        score=score,
        level=level
    )

    return JsonResponse({
        'status': 'success',
        'message': 'Score recorded successfully',
        'score': format_score(record)
    }, status=201)


@require_http_methods(["GET"])
def game_config_view(request):
    """Returns the active game configuration or default settings."""
    config = GameConfig.objects.filter(is_active=True).first()
    if not config:
        # Fallback defaults identical to original flexigame.html
        return JsonResponse({
            'status': 'success',
            'config': {
                'name': 'Default',
                'canvas_w': 560,
                'canvas_h': 480,
                'shoulder_radius': 22,
                'bullet_radius': 9,
                'base_interval': 1200,
                'speed_base': 4.0,
                'lives_max': 3,
            }
        })
    return JsonResponse({
        'status': 'success',
        'config': format_config(config)
    })
