FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG PHONE_NUMBER
RUN if [ -n "${PHONE_NUMBER}" ]; then \
      sed -i "s|phone:.*|phone: \"${PHONE_NUMBER}\"|" src/data/resume.yaml; \
    fi

RUN npm run build

FROM python:3.14-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY pyproject.toml /app/
RUN pip install --upgrade pip && pip install . && useradd -m -u 1000 appuser
COPY --from=builder /app/dist /app/dist
COPY app.py /app/app.py
USER appuser
EXPOSE 8080
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
