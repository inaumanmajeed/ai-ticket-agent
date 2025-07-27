import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  url: process.env.CHROMADB_URL || "http://localhost:8000",
});
const collectionName = "support_tickets";

let collection = null;

const mockEmbeddingFunction = {
  generate: async (texts) => {
    return texts.map(() => Array.from({ length: 384 }, () => Math.random()));
  },
};

async function getCollection() {
  if (!collection) {
    // Always delete and recreate to ensure embedding function is set
    try {
      await client.deleteCollection({ name: collectionName });
    } catch (err) {
      // Ignore if not found
    }
    collection = await client.createCollection({
      name: collectionName,
      embeddingFunction: mockEmbeddingFunction,
    });
  }
  return collection;
}

export async function storeTicket(text, result) {
  try {
    const coll = await getCollection();
    // Generate a random embedding with correct dimension (384)
    const embedding = Array.from({ length: 384 }, () => Math.random());
    // Sanitize metadata: only allow string, number, boolean, or null
    const sanitizeMetadata = (obj) => {
      const meta = {};
      for (const [key, value] of Object.entries(obj)) {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value === null
        ) {
          meta[key] = value;
        } else if (Array.isArray(value)) {
          meta[key] = JSON.stringify(value);
        } else if (typeof value === "object" && value !== null) {
          meta[key] = JSON.stringify(value);
        } else {
          meta[key] = String(value);
        }
      }
      return meta;
    };
    await coll.add({
      documents: [text],
      metadatas: [
        {
          ...sanitizeMetadata(result),
          timestamp: new Date().toISOString(),
        },
      ],
      ids: [Date.now().toString()],
      embeddings: [embedding],
    });
  } catch (err) {
    console.error("Error storing ticket:", err);
  }
}

// export async function getSimilarTickets(text, limit = 3) {
//   try {
//     const coll = await getCollection();
//     if (!text) {
//       // Return recent tickets if no query
//       const results = await coll.get({ limit });
//       return results;
//     }

//     const results = await coll.query({
//       queryTexts: [text],
//       nResults: limit,
//     });
//     return results;
//   } catch (err) {
//     console.error("Error querying similar tickets:", err);
//     return { documents: [] };
//   }
// }
