#!/bin/bash
set -e

echo ">>> Bước 1: Build JAR (Maven local)..."
cd backend
mvn package -DskipTests -q
cd ..

echo ">>> Bước 2: Build và restart Docker containers..."
docker compose up -d --build

echo ">>> Done! Containers đang chạy:"
docker ps --filter "name=personal-web" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
