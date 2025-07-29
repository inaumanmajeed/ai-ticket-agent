import "dotenv/config";
import express from "express";
import cors from "cors";

import { processTicketWithGraph } from "./ticketProcessor.js";
import { getSimilarTicket, storeTicket } from "./chromadb.js";

const app = express();

// --- CORS ---
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

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
    const result = await processTicketWithGraph(text);

    // Step 3: Storing new ticket + AI response
    await storeTicket(text, result.response);

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
