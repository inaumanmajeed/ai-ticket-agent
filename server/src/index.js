import "dotenv/config";
import express from "express";
import cors from "cors";

import { processTicketWithSinglePrompt } from "./ticketProcessor.js";
import { getSimilarTicket, storeTicket } from "./chromadb.js";

const app = express();

// --- CORS ---
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Define the specific error message to check for
const ERROR_RESPONSE_MESSAGE =
  "I apologize, but I encountered an error. Please try again or contact support.";

// --- Routes ---
// ping/health check
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Process support ticket
app.post("/api/ticket", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing ticket text" });

  try {
    // Step 1: Trying to find a similar ticket
    const similar = await getSimilarTicket(text);
    if (similar) {
      console.log("✅ Matched from ChromaDB");
      return res.json({
        response: similar.metadata.response,
        matched: true,
      });
    }

    // Step 2: If no match, running through LLM
    const result = await processTicketWithSinglePrompt(text);

    // Step 3: Storing new ticket + AI response ONLY if it's not an error message
    // and if a response exists.
    if (result.response && result.response !== ERROR_RESPONSE_MESSAGE) {
      await storeTicket(text, result.response);
      console.log("Ticket and response stored in ChromaDB.");
    } else {
      console.warn("Skipping storage: Response was an error message or empty.");
    }

    res.json({
      ...result,
      matched: false,
    });
  } catch (err) {
    console.error("❌ Error processing ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
