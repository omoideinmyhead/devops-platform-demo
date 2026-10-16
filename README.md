# Arcana — AI tarot readings

A React + TypeScript tarot experience backed by FastAPI. Ask a question, choose a one-card or three-card spread, select face-down cards, reveal them, and explore a reading. Includes a searchable 78-card catalog, locally rendered symbolic SVG artwork, responsive styling, keyboard controls, and reduced-motion support.

## Run locally

Requires Python 3.14+ and Node.js 24.

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/uvicorn app.main:app --reload
```

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to FastAPI at port 8000. API documentation: http://localhost:8000/docs.

## Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:8080. Nginx serves the React build and proxies API traffic to FastAPI. The backend health endpoint remains `/health`. The frontend `/health` checks Nginx itself.

## AI configuration

Demo mode is the default and is clearly labeled. It generates deterministic reflections from the question and card meanings; it does not call an AI provider. For live readings set server-side environment variables:

```bash
export READING_MODE=ai
export OPENAI_API_KEY='your-key'
export OPENAI_MODEL=gpt-4o-mini
.venv/bin/uvicorn app.main:app --reload
```

For Compose, edit the ignored `.env` file instead. Never put the key in frontend variables or commit it. Local Python startup does not automatically load `.env`.

The provider adapter uses the [OpenAI Responses API with structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), `store: false`, a 45-second timeout, Pydantic validation, and exact card matching. The model is configurable and must support structured outputs. Failures return a retryable error; AI mode never silently falls back to demo. Question text is not logged by the application. Questions are sent to OpenAI in AI mode; `store: false` does not imply zero provider retention.

## API

- `GET /health`: process health.
- `GET /api/config`: active reading mode.
- `GET /api/cards`: canonical 78-card deck.
- `POST /api/draws`: `{ "spread": "one" | "three" }`; unique random cards, positions, and orientations.
- `POST /api/readings`: question, spread, and drawn cards; returns overall reading, per-card interpretations, reflection prompts, and mode.

Draws are stateless. The API validates submitted card identifiers, uniqueness, count, orientation, and spread positions; it does not prove that cards came from a prior draw. The visible deck is a selection ritual: the server randomly samples cards first, and clicks determine reveal order.

## Kubernetes

The original Deployment/Service scaffold is retained and expanded into two backend replicas and two frontend replicas, with health probes, resource limits, and restricted container permissions. The backend is private within the cluster; NodePort 30080 exposes the frontend for local demos.

CI publishes both images to GitHub Container Registry on every merge to `main`, tagged with the commit SHA. The deployed version is pinned in `k8s/kustomization.yaml`, so the cluster pulls immutable images straight from the registry:

```bash
kubectl kustomize k8s/ | grep image:   # preview the rendered image tags
kubectl apply -k k8s/
kubectl port-forward svc/tarot-frontend 8080:80
```

Then open http://localhost:8080.

To deploy another version, or roll back, set `newTag` in `k8s/kustomization.yaml` to that commit's SHA and run `kubectl apply -k k8s/` again.

For production, change the frontend Service to ClusterIP and customize `k8s/ingress.yaml` for your ingress controller, domain, and TLS secret before adding it to the kustomization. The ingress is intentionally excluded from the local setup.

For AI mode, provision a Kubernetes Secret named `tarot-ai` with the key `OPENAI_API_KEY` through your secret management process; change `READING_MODE` in the ConfigMap to `ai` and restart the backend Deployment. Secret values are not checked into the repository.

`READINGS_PER_MINUTE` defaults to 10 and applies per client address, per backend process. Behind Nginx, clients share the proxy address and therefore the quota. Multi-replica production needs rate limiting at ingress or a shared store; do not rely on this local guard for public traffic. Configure provider spend limits before opening public access.

## Verification and CI

```bash
.venv/bin/python -m pytest -q
cd frontend
npm run build
```

GitHub Actions runs backend tests, TypeScript checks, the frontend production build, and both Docker image builds on pull requests and pushes to main/feature branches. 
On pushes to `main`, both images are also published to GHCR, tagged with the commit SHA and `latest`. Deployment to a cluster is not yet automated.

The tests cover deck completeness, spread validation, unique draws, demo readings, rate limiting, missing credentials, and mocked AI success, refusals, malformed responses, card mismatches, timeouts, and HTTP errors. No real AI calls are needed.

Fonts use Google Fonts with local system fallbacks. Card art is original code-rendered symbolism; five motifs are reused throughout the deck, rather than 78 individual illustrations. Accounts and durable reading history are outside the initial scope. Tarot content is presented for reflection and entertainment.

## Implementation validation

Verified during implementation: 17 backend tests passed; the TypeScript check and production build passed; both Docker images built; an isolated Compose stack became healthy; headless Chrome completed both spread sizes and opened the 78-card library; desktop and mobile screenshots were inspected with no horizontal overflow; Kubernetes manifests passed a client-side dry-run with schema validation disabled. The temporary Compose stack was removed after verification. Live OpenAI calls were not performed. The Kubernetes manifests were deployed to a local cluster using the GHCR images.
