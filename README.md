# Transfer Documents Worker

## Introduction
This project implements a reusable worker architecture using Node.js and RabbitMQ. It allows for easy instantiation of multiple workers to process different types of messages efficiently and scalably.

## Architecture
- RabbitMQ: Handles message brokering with exchanges and queues.
- Workers: Consume and process messages from RabbitMQ.
- Docker: Containerizes the workers for easy deployment.

## Prerequisites
- Node.js
- Docker & Docker Compose
= RabbitMQ

### Using Docker Compose

```yaml
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest

  transfer_documents_worker:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - WORKER_TYPE=documents
      - AMQP_URL=amqp://rabbitmq:5672
    depends_on:
      - rabbitmq

  transfer_user_worker:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - WORKER_TYPE=user
      - AMQP_URL=amqp://rabbitmq:5672
    depends_on:
      - rabbitmq
```

Then execute it with:

```bash
docker-compose up --build
```