#!/bin/bash

echo "🚀 Starting full backend stack..."

# Step 1: Start Flask Embedding Server
echo "🔢 Starting embedding server..."
(
  cd src/embedding_server || exit
  echo "🧠 Embedding server running on http://localhost:5050"
  python3 embedding_server.py &
  EMBED_PID=$!
)

# Step 2: Start Chroma DB in Docker
echo "🐳 Starting ChromaDB via Docker..."
docker-compose up -d

# Step 3: Wait a few seconds
sleep 5

# Step 4: Start Node backend
echo "🌐 Starting Node.js server..."
npm run dev

# Cleanup on exit (optional)
trap "kill $EMBED_PID; docker-compose down" EXIT
