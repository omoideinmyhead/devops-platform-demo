import json
import httpx
import pytest
from fastapi.testclient import TestClient
from app import main, provider
from app.cards import CARDS

@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv('READING_MODE', 'demo')
    main._buckets.clear()
    with TestClient(main.app) as client:
        yield client

def reading_request(client, spread='three'):
    draw = client.post('/api/draws', json={'spread': spread}).json()
    return {'question': 'What should I focus on next?', **draw}

def test_health_and_deck(client):
    assert client.get('/health').json() == {'status': 'healthy'}
    deck = client.get('/api/cards').json()
    assert len(deck) == len({c['id'] for c in deck}) == 78
    assert sum(c['arcana'] == 'Major Arcana' for c in deck) == 22
    assert client.get('/info').status_code == 404

@pytest.mark.parametrize('spread,count', [('one', 1), ('three', 3)])
def test_draw_and_demo_reading(client, spread, count):
    payload = reading_request(client, spread)
    assert len(payload['cards']) == count
    assert len({c['card_id'] for c in payload['cards']}) == count
    response = client.post('/api/readings', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['mode'] == 'demo'
    assert payload['question'] in data['overall']
    assert [c['card_id'] for c in data['cards']] == [c['card_id'] for c in payload['cards']]
    assert response.headers['cache-control'] == 'no-store'

@pytest.mark.parametrize('mutation', ['duplicate', 'unknown', 'position', 'count', 'question', 'orientation'])
def test_reject_invalid_readings(client, mutation):
    payload = reading_request(client)
    if mutation == 'duplicate': payload['cards'][1]['card_id'] = payload['cards'][0]['card_id']
    if mutation == 'unknown': payload['cards'][0]['card_id'] = 'invented'
    if mutation == 'position': payload['cards'][0]['position'] = 'Wrong position'
    if mutation == 'count': payload['cards'].pop()
    if mutation == 'question': payload['question'] = '   '
    if mutation == 'orientation': payload['cards'][0]['orientation'] = 'sideways'
    assert client.post('/api/readings', json=payload).status_code == 422

def test_limit(client, monkeypatch):
    monkeypatch.setenv('READINGS_PER_MINUTE', '1')
    payload = reading_request(client)
    assert client.post('/api/readings', json=payload).status_code == 200
    response = client.post('/api/readings', json=payload)
    assert response.status_code == 429
    assert response.headers['retry-after'] == '60'

def test_ai_missing_key(client, monkeypatch):
    monkeypatch.setenv('READING_MODE', 'ai')
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    assert client.post('/api/readings', json=reading_request(client)).status_code == 503

@pytest.mark.parametrize('result', ['success', 'mismatch', 'refusal', 'timeout', 'malformed', 'http_error'])
def test_ai_provider(client, monkeypatch, result):
    payload = reading_request(client)
    monkeypatch.setenv('READING_MODE', 'ai')
    monkeypatch.setenv('OPENAI_API_KEY', 'test-only')
    monkeypatch.setenv('OPENAI_MODEL', 'test-model')
    content = {'title': 'A new perspective', 'overall': 'Consider your next small step.',
               'cards': [{'card_id': c['card_id'], 'interpretation': 'A thoughtful reflection.'} for c in payload['cards']],
               'reflection_prompts': ['What is within your control?']}
    if result == 'mismatch': content['cards'][0]['card_id'] = 'wrong'
    def handle(request):
        sent = json.loads(request.content)
        assert sent['store'] is False
        assert sent['model'] == 'test-model'
        assert sent['text']['format']['strict'] is True
        if result == 'timeout': raise httpx.ReadTimeout('test timeout')
        if result == 'http_error': return httpx.Response(429)
        if result == 'refusal': return httpx.Response(200, json={'status': 'completed', 'output': [{'type': 'message', 'content': [{'type': 'refusal', 'refusal': 'No'}]}]})
        return httpx.Response(200, json={'status': 'completed', 'output': [{'type': 'message', 'content': [{'type': 'output_text', 'text': 'bad json' if result == 'malformed' else json.dumps(content)}]}]})
    original_client = httpx.AsyncClient
    monkeypatch.setattr(provider.httpx, 'AsyncClient', lambda **kwargs: original_client(transport=httpx.MockTransport(handle), **kwargs))
    response = client.post('/api/readings', json=payload)
    assert response.status_code == (200 if result == 'success' else 503)
    if result == 'success': assert response.json()['mode'] == 'ai'
    else: assert 'test-only' not in response.text
