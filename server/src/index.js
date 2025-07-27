import "dotenv/config";
import express from "express";
import cors from "cors";

import { processTicketWithGraph } from "./ticketProcessor.js";
import { storeTicket } from "./chromadb.js";

const app = express();

// --- CORS ---
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

app.post("/api/ticket", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing ticket text" });

  try {
    const result = await processTicketWithGraph(text);
    await storeTicket(text, result);
    // const similar = await getSimilarTickets(text);

    res.json({
      ...result,
      // similar: similar.documents || [],
    });
  } catch (err) {
    console.error("Error processing ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
