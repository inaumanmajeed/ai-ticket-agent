````markdown
# AI-Powered Support Ticket System

## 🚀 Overview

This project implements an **AI-powered support ticket system** designed to efficiently handle general ticketing and travel-related queries. It leverages **Large Language Models (LLMs)** for intelligent response generation and a **ChromaDB vector store** for efficient retrieval of similar, previously resolved tickets. Our main goal is to **automate responses to common queries**, reduce human intervention, and improve response times for support requests.

The system is built as a **Node.js Express API** that interacts with a **Python-based embedding server** (using SentenceTransformers) and a **ChromaDB instance**. When a new support ticket comes in, the system first tries to find a similar, already resolved ticket in the database. If no sufficiently similar ticket is found, it then uses an LLM to generate a new response. New, non-error responses are then stored to enrich the knowledge base.


## 🏗️ Architecture

The system consists of these key components:

* **Express.js API (Node.js):** This is the main application server. It exposes an endpoint for receiving support ticket requests and manages the flow of ticket processing, including checking for similar tickets, invoking the LLM, and storing new information.
* **ChromaDB:** A **vector database** used to store support ticket texts and their corresponding AI-generated responses as embeddings. This allows for fast similarity searches.
* **Embedding Server (Python/Flask):** A separate Python Flask application that provides an API endpoint for generating **embeddings** from text using the `SentenceTransformer` model (`all-MiniLM-L6-v2`). This microservice is crucial for converting text into numerical vectors that ChromaDB can use for similarity comparisons.
* **Large Language Model (LLM) - DeepSeek via OpenRouter.ai:** An external AI service (DeepSeek's `deepseek/deepseek-chat-v3-0324:free` model accessed via OpenRouter.ai) responsible for understanding the user's query, classifying it, and generating a structured response when no similar ticket is found.


## ✨ Core Functionality

### Ticket Processing Workflow

When a new support ticket (text) is received via the `/api/ticket` endpoint, the system performs the following steps:

1.  **Similarity Search (ChromaDB):**
    * The incoming ticket text is first converted into an **embedding** using the external embedding server.
    * This embedding is then used to query ChromaDB for the most similar existing tickets.
    * If a similar ticket (with a distance threshold of `< 0.2`) is found, its pre-recorded AI response is immediately returned. This is a **"cache hit" scenario**, providing a fast and consistent response.

2.  **LLM Processing (if no similar ticket):**
    * If no sufficiently similar ticket is found in ChromaDB, the original ticket text is sent to the configured LLM (DeepSeek).
    * The LLM processes the text based on a detailed system prompt.

3.  **LLM Response Generation & Classification:**
    * The LLM is instructed to return a **structured JSON object** containing:
        * `action`: "greet", "irrelevant", or "respond"
        * `category`: "Billing", "Technical", "Account", or "Other" (for "respond" action only)
        * `confidence`: "High", "Moderate", or "Low" (for "respond" action only)
        * `response`: The full user-facing answer.
    * **Specific LLM rules:**
        * **Greetings:** If the input is mainly a greeting, an `"action": "greet"` response is returned with a friendly welcome message.
        * **Irrelevant Queries:** If the query isn't about general ticketing or travel support, an `"action": "irrelevant"` response is provided, redirecting the user to general support.
        * **Relevant Queries:** For relevant queries, the LLM classifies the query, estimates its **confidence level**, and generates a detailed, structured answer.
        * **Low Confidence:** If the LLM's confidence is "Low," a default message ("Your query is forwarded to our team, we will get back to you shortly.") is returned, indicating the need for human intervention.

4.  **Knowledge Base Enrichment (ChromaDB):**
    * If the LLM generates a valid response (i.e., not an error message), the original ticket text and the LLM's generated response are stored as a new entry in ChromaDB. This continuously **expands the system's knowledge base**, improving the accuracy and frequency of future similarity matches.

### Error Handling

* The system includes robust **error handling** for API calls, LLM processing, and ChromaDB interactions.
* A specific `ERROR_RESPONSE_MESSAGE` is defined and used when the LLM encounters an issue or returns an unparseable response. This prevents problematic content from being stored in the database.
* Detailed **console logging** helps in debugging and monitoring the system's operation.


## 🔌 API Endpoints

### `/ping` (GET)

* **Purpose:** Health check endpoint to verify the server is running.
* **Response:**
    ```json
    {
      "message": "pong"
    }
    ```

### `/api/ticket` (POST)

* **Purpose:** Processes a new support ticket.
* **Request Body:**
    ```json
    {
      "text": "The user's support ticket message here."
    }
    ```
* **Responses:**
    * **200 OK (Similar Ticket Found):**
        ```json
        {
          "response": "Response from the similar ticket.",
          "matched": true
        }
        ```
    * **200 OK (LLM Processed):**
        ```json
        {
          "response": "AI-generated response from LLM.",
          "confidence": "High" | "Moderate" | "Low" | "N/A",
          "category": "Billing" | "Technical" | "Account" | "Other" | "N/A",
          "matched": false
        }
        ```
    * **400 Bad Request:**
        ```json
        {
          "error": "Missing ticket text"
        }
        ```
    * **500 Internal Server Error:**
        ```json
        {
          "error": "Error message from the server."
        }
        ```


## 🛠️ Setup and Installation

### Prerequisites

* **Node.js** (LTS version recommended)
* **Python 3.x**
* **Docker** (recommended for running ChromaDB)
* **npm** (Node Package Manager)
* **pip** (Python Package Installer)

### Environment Variables

Create a `.env` file in the project root with the following variables:

````

DEEPSEEK\_API\_KEY=your\_deepseek\_api\_key
CHROMADB\_URL=http://localhost:8000 \# Or your ChromaDB instance URL

````

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/inaumanmajeed/ai-ticket-agent.git
    cd ai-ticket-agent/server
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the Python Embedding Server:**
    * Navigate to the directory containing the `embedding_server.py` script.
    * Install Python dependencies:
        ```bash
        cd src/embedding_server
        pip install Flask sentence-transformers
        cd ../.. # Go back to the project root
        ```

### Running the Applications

To simplify starting the entire backend stack, a convenience script `run_backend.sh` is provided. This script will:
1.  Start the Python embedding server.
2.  Start ChromaDB using Docker Compose.
3.  Wait a few seconds for ChromaDB to initialize.
4.  Start the Node.js Express backend.

**Note:** Ensure you have Docker and Docker Compose installed and running for ChromaDB.

#### `run_backend.sh` Script:

```bash
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

# Cleanup on exit (optional): This trap ensures that if the script is interrupted (e.g., Ctrl+C),
# the embedding server process and Docker containers are shut down cleanly.
trap "kill $EMBED_PID; docker-compose down" EXIT
````

#### How to run:

1.  Make the script executable:
    ```bash
    chmod +x run_backend.sh
    ```
2.  Run the script from your project root:
    ```bash
    ./run_backend.sh
    ```

This script will keep all components running in your terminal. To stop them, simply press `Ctrl+C` in the terminal where `run_backend.sh` is running.

-----

## 📁 Project Structure

```
.
├── src/                           # Source directory
│   └── embedding_server/          # Contains the Python embedding server
│       └── embedding_server.py
├── └── index.js                   # Main Express application, routes, and orchestration
├── └── ticketProcessor.js         # Logic for LLM interaction and prompt engineering
├── └── chromadb.js                # ChromaDB client, collection management, and RAG logic
├── └── embedding.js               # Wrapper for calling the external embedding server
├── package.json                   # Node.js project dependencies
├── package-lock.json
├── .env                           # Environment variables
└── run_backend.sh                 # Script to start all backend components
```