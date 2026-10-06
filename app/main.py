from fastapi import FastAPI
import socket

app = FastAPI()


@app.get("/")
def root():
    return {"message": "DevOps Platform Demo"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/info")
def info():
    return {
        "hostname": socket.gethostname()
    }