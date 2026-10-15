FROM python:3.14-slim
WORKDIR /srv
COPY app/requirements.txt /srv/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt && useradd --uid 10001 --create-home tarot
COPY app/ /srv/app/
USER tarot
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-proxy-headers"]
