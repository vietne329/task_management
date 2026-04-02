#!/bin/bash
set -e

# Đảm bảo dùng Java 21
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo ">>> Bước 1: Build JAR (Maven local)..."
cd backend
mvn package -DskipTests -q
cd ..

echo ">>> Bước 2: Build và restart Docker containers..."
docker compose up -d --build

echo ">>> Done! Containers đang chạy:"
docker ps --filter "name=personal-web" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
