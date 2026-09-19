import json
from django.test import TestCase, Client
from django.urls import reverse
from .models import SiteMetricSession

class MetricsApiTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_empty_metrics_summary(self):
        response = self.client.get(reverse('metrics_summary'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['total_visitors'], 0)
        self.assertEqual(data['total_retries'], 0)
        self.assertEqual(data['total_time_spent_seconds'], 0.0)
        self.assertEqual(data['average_time_spent_seconds'], 0.0)

    def test_track_visit_and_retries_and_time_spent(self):
        # 1. Track visit
        res1 = self.client.post(
            reverse('track_metric'),
            data=json.dumps({'session_id': 'sess-alpha', 'action': 'visit'}),
            content_type='application/json'
        )
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(SiteMetricSession.objects.count(), 1)

        # 2. Track retry
        res2 = self.client.post(
            reverse('track_metric'),
            data=json.dumps({'session_id': 'sess-alpha', 'action': 'retry'}),
            content_type='application/json'
        )
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()['session']['retries'], 1)

        # 3. Track time spent
        res3 = self.client.post(
            reverse('track_metric'),
            data=json.dumps({'session_id': 'sess-alpha', 'action': 'time_spent', 'seconds': 65}),
            content_type='application/json'
        )
        self.assertEqual(res3.status_code, 200)
        self.assertEqual(res3.json()['session']['time_spent_seconds'], 65.0)

        # 4. Check summary
        res4 = self.client.get(reverse('metrics_summary'))
        self.assertEqual(res4.status_code, 200)
        summary = res4.json()
        self.assertEqual(summary['total_visitors'], 1)
        self.assertEqual(summary['total_retries'], 1)
        self.assertEqual(summary['total_time_spent_seconds'], 65.0)
        self.assertEqual(summary['average_time_spent_seconds'], 65.0)
        self.assertEqual(summary['total_time_spent_formatted'], '1m 5s')

    def test_track_metric_validation(self):
        # Missing session_id
        res = self.client.post(
            reverse('track_metric'),
            data=json.dumps({'action': 'visit'}),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 400)

        # Unknown action
        res = self.client.post(
            reverse('track_metric'),
            data=json.dumps({'session_id': 'sess-beta', 'action': 'unknown_action'}),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 400)

