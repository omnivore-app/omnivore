FROM python:3.8-slim

WORKDIR /app

ENV GRPC_PYTHON_BUILD_SYSTEM_OPENSSL "1"
ENV GRPC_PYTHON_BUILD_SYSTEM_ZLIB "1"

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000
CMD ["python", "serve.py"]
