from fastapi.testclient import TestClient

import main
from main import app

# TestClient 直接在内存里调用 FastAPI app，不需要真的启动 uvicorn 服务器。
client = TestClient(app)


def test_root_returns_message():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "DevOps Platform Demo"}


def test_health_returns_healthy():
    # 之后 k8s 的 readinessProbe / livenessProbe 会调用这个接口，
    # 所以要保证它稳定返回 200。
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_info_returns_hostname(monkeypatch):
    # 在 k8s 里 hostname 就是 Pod 名字，多副本时可以用它看出请求打到了哪个 Pod。
    # 这里用 monkeypatch 把 socket.gethostname 换成固定值，让测试结果可预测。
    monkeypatch.setattr(main.socket, "gethostname", lambda: "test-pod-123")

    response = client.get("/info")

    assert response.status_code == 200
    assert response.json() == {"hostname": "test-pod-123"}


def test_unknown_route_returns_404():
    response = client.get("/does-not-exist")

    assert response.status_code == 404
