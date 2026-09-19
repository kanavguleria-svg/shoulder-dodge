from django.http import JsonResponse
from django.db.models import Sum, Avg
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import GameScore, GameConfig, SiteMetricSession
from .utils import parse_json_body, format_score, format_config, format_duration


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


@require_http_methods(["GET"])
def metrics_summary_view(request):
    """Returns aggregated site and gameplay metrics."""
    total_visitors = SiteMetricSession.objects.count()
    aggs = SiteMetricSession.objects.aggregate(
        total_retries=Sum('retries'),
        total_time=Sum('time_spent_seconds'),
        avg_time=Avg('time_spent_seconds')
    )

    total_retries = aggs['total_retries'] or 0
    total_time_spent = round(aggs['total_time'] or 0.0, 1)
    avg_time_spent = round(aggs['avg_time'] or 0.0, 1)

    return JsonResponse({
        'status': 'success',
        'total_visitors': total_visitors,
        'total_retries': total_retries,
        'total_time_spent_seconds': total_time_spent,
        'average_time_spent_seconds': avg_time_spent,
        'total_time_spent_formatted': format_duration(total_time_spent),
        'average_time_spent_formatted': format_duration(avg_time_spent),
    })


@csrf_exempt
@require_http_methods(["POST"])
def track_metric_event_view(request):
    """Ingests client-side telemetry events for visits, retries, and time spent."""
    data = parse_json_body(request)
    if not data:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON body'}, status=400)

    session_id = str(data.get('session_id', '')).strip()[:64]
    if not session_id:
        return JsonResponse({'status': 'error', 'message': 'session_id is required'}, status=400)

    action = str(data.get('action', '')).lower().strip()
    session, created = SiteMetricSession.objects.get_or_create(session_id=session_id)

    if action == 'visit':
        # Handled by get_or_create; session is now recorded
        pass
    elif action == 'retry':
        session.retries += 1
        session.save(update_fields=['retries', 'updated_at'])
    elif action == 'time_spent':
        try:
            secs = float(data.get('seconds', 0.0))
            if secs > 0:
                session.time_spent_seconds += secs
                session.save(update_fields=['time_spent_seconds', 'updated_at'])
        except (ValueError, TypeError):
            return JsonResponse({'status': 'error', 'message': 'seconds must be a valid number'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': f'Unknown action: {action}'}, status=400)

    return JsonResponse({
        'status': 'success',
        'message': f'Metric event {action} recorded',
        'session': {
            'session_id': session.session_id,
            'retries': session.retries,
            'time_spent_seconds': round(session.time_spent_seconds, 1)
        }
    })

