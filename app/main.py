import os
import secrets
import time
from collections import OrderedDict
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from app.cards import CARDS, POSITIONS
from app.models import DrawRequest, ReadingRequest, ReadingResponse
from app.provider import ProviderError, generate_reading, mode
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title='Arcana Tarot', version='1.0.0')
# Exposes Prometheus metrics (request count, latency histogram) at /metrics.
# /metrics and /health are excluded so scrapes and probes don't skew the numbers.
Instrumentator(excluded_handlers=['/metrics', '/health']).instrument(app).expose(app, include_in_schema=False)
# Per-process guard; a shared ingress limit is required for multi-replica production.
_buckets: OrderedDict[str, list[float]] = OrderedDict()

@app.middleware('http')
async def limit_requests(request: Request, call_next):
    if request.url.path == '/api/readings' and request.method == 'POST':
        host = request.client.host if request.client else 'unknown'
        now = time.monotonic()
        hits = [stamp for stamp in _buckets.pop(host, []) if now - stamp < 60]
        limit = int(os.getenv('READINGS_PER_MINUTE', '10'))
        _buckets[host] = hits
        while len(_buckets) > 10000:
            _buckets.popitem(last=False)
        if len(hits) >= limit:
            return JSONResponse({'detail': 'Please wait a minute before requesting another reading.'}, status_code=429, headers={'Retry-After': '60'})
        hits.append(now)
    response = await call_next(request)
    response.headers['Cache-Control'] = 'no-store' if request.url.path == '/api/readings' else 'no-cache'
    return response

@app.get('/health')
def health():
    return {'status': 'healthy'}

@app.get('/api/config')
def config():
    try:
        return {'mode': mode()}
    except ProviderError as exc:
        raise HTTPException(503, str(exc)) from exc

@app.get('/api/cards')
def cards():
    return CARDS

@app.post('/api/draws')
def draw(request: DrawRequest):
    chosen = secrets.SystemRandom().sample(CARDS, len(POSITIONS[request.spread]))
    return {'spread': request.spread, 'cards': [
        {'card_id': card['id'], 'position': position, 'orientation': secrets.choice(['upright', 'reversed'])}
        for card, position in zip(chosen, POSITIONS[request.spread])
    ]}

@app.post('/api/readings', response_model=ReadingResponse)
async def reading(request: ReadingRequest):
    try:
        return await generate_reading(request)
    except ProviderError as exc:
        raise HTTPException(503, str(exc)) from exc
