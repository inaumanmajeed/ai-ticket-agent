```markdown
# 🎫 AI-Powered Support Ticket System

## Project Overview

This project is a full-stack, AI-powered support ticket system designed to automate and streamline the process of handling customer queries related to general ticketing and travel. It leverages modern web technologies and advanced AI capabilities, including Large Language Models (LLMs) and vector databases, to provide intelligent, instant, and contextually relevant responses to user inquiries.

The application is structured into two main components: a **client-side (frontend) interface** for user interaction and a **server-side (backend) API** that handles all the AI logic, data storage, and external service integrations.

### Key Goals:

* **Automate Responses:** Provide immediate answers to common support questions.
* **Improve Efficiency:** Reduce the workload on human support agents by handling routine queries.
* **Enhance User Experience:** Offer quick and relevant support, minimizing wait times.
* **Dynamic Knowledge Base:** Continuously learn and adapt by storing new ticket resolutions.

## 🌐 Application Flow and Core Components

The system operates through a seamless interaction between the frontend and backend components:

### 1. Frontend (Client - `client/` folder)

The frontend is a **React.js single-page application** that provides an intuitive chat-like interface for users to submit their support queries.

* **User Interface:** Users interact through a chat window where they can type their support requests. The interface displays both user messages and AI-generated responses in a conversational format.
* **State Management:** It manages the current input text, the history of messages (user and bot), and UI states such as loading indicators and error messages.
* **Communication with Backend:** When a user submits a ticket, the frontend captures the input and dispatches an **HTTP POST request** to the backend API with the user's ticket text.
* **Displaying Responses:** Upon receiving a response from the backend, the frontend updates its state to display the AI's answer in the chat interface. It handles different response types, including direct answers, greetings, or messages indicating irrelevance or an error. Markdown formatting within AI responses is supported for clear presentation.

### 2. Backend (Server - `server/` folder)

The backend is a **Node.js Express API** that serves as the brain of the operation, orchestrating the AI-powered support logic. This component is comprehensively documented in its own `server/README.md`.

* **API Endpoint:** This is the primary endpoint that the frontend calls to submit a user's support ticket.
* **Ticket Processing Orchestration:** Upon receiving a ticket, the backend executes a multi-step process:
    1.  **Similarity Search:** It first queries a **ChromaDB vector database** to check if a highly similar ticket has been processed before. This involves converting the incoming text into a numerical embedding using a dedicated **Python Embedding Server**. If a sufficiently similar ticket is found, its pre-recorded AI response is immediately returned, providing a fast "cache hit" resolution.
    2.  **LLM Inference:** If no similar ticket is found, the backend forwards the user's query to a **Large Language Model (LLM)** (specifically DeepSeek via OpenRouter.ai). The LLM analyzes the text, classifies the query (e.g., Billing, Technical), estimates its confidence, and generates a structured response based on a carefully engineered prompt.
    3.  **Knowledge Base Enrichment:** If the LLM generates a valid, non-error response, the original ticket text and the new AI response are stored in ChromaDB. This continuously expands the system's knowledge base, improving the accuracy and frequency of future similarity matches.
* **External Services:** The backend integrates with:
    * **Python Embedding Server:** A Flask application (running as a separate microservice) responsible for converting text into vector embeddings, crucial for similarity searches in ChromaDB.
    * **ChromaDB:** A persistent vector store for efficient storage and retrieval of ticket embeddings and their associated responses.
    * **OpenRouter.ai (for DeepSeek LLM):** An API gateway used to access the DeepSeek Large Language Model for intelligent text generation.

## 🤝 How They Work Together

1.  A user types a support query into the React frontend and clicks "Send."
2.  The React application sends this query to the Node.js backend's API endpoint.
3.  The Node.js backend receives the query.
4.  It consults the Python Embedding Server to get an embedding for the query.
5.  It uses this embedding to search ChromaDB for similar past tickets.
6.  * **If a match is found:** The backend retrieves the stored AI response from ChromaDB and sends it back to the frontend.
7.  * **If no match is found:** The backend sends the query to the DeepSeek LLM (via OpenRouter.ai). The LLM processes the query, generates a classified and structured response, which is then sent back to the backend. The backend also stores this new query and response in ChromaDB for future use.
8.  The React frontend receives the AI's response and displays it in the chat interface, continuing the conversation with the user.

This architecture ensures a modular, scalable, and intelligent support system capable of handling a wide range of ticketing and travel-related inquiries efficiently.

---

## 📚 Detailed Documentation

For more in-depth information about the backend's functionality, API endpoints, setup instructions, and future enhancements, please refer to the `server/README.md` file located in the `server` directory.
```