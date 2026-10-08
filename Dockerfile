# 用一个已经装好 Python 3.12 的轻量 Linux 镜像作为基础。
FROM python:3.12-slim

# 容器里面创建并进入 /app, 之后的命令默认都在这个目录执行。
WORKDIR /app

# 把你电脑上的 app/requirements.txt 复制进容器当前目录 /app
COPY app/requirements.txt .

# 在构建镜像的时候安装Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

#把 app/main.py 这些application code复制到容器里的/app/
COPY app/ .

#就是容器启动以后自动执行 uvicorn main:app --host 0.0.0.0 --port 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]