import { ChromaClient } from "chromadb";
import { v4 as uuidv4 } from "uuid";
import { embedText } from "./embedding.js"; // This is your custom embedding function

const client = new ChromaClient({
  url: process.env.CHROMADB_URL || "http://localhost:8000",
});

const collectionName = "support_tickets";
let collection;

async function initCollection() {
  if (!collection) {
    const collections = await client.listCollections();
    const exists = collections.some((c) => c.name === collectionName);

    collection = exists
      ? await client.getCollection({ name: collectionName })
      : await client.createCollection({
          name: collectionName,
          // Explicitly pass your custom embedding function
          // ChromaDB client requires an object with a 'generate' method.
          // Your current embedText function takes one string and returns one embedding.
          // The 'generate' method here needs to take an array of strings and return an array of embeddings.
          embeddingFunction: {
            generate: async (texts) => {
              // Ensure embedText can handle an array of texts, or map it.
              // Assuming embedText is designed for a single string, we map it:
              return await Promise.all(texts.map((text) => embedText(text)));
            },
            // You might also need a 'model' property for some ChromaDB versions/integrations,
            // or just ensure your `embedText` is robust.
            // If you keep getting this specific error, it means ChromaDB's internal `DefaultEmbeddingFunction`
            // is still being triggered.
          },
        });
  }
  return collection;
}

export async function getSimilarTicket(text) {
  const collection = await initCollection();
  // We still explicitly embed here for querying
  const embedding = await embedText(text);
  const results = await collection.query({
    queryEmbeddings: [embedding],
    nResults: 1,
  });

  if (
    results.distances?.[0]?.[0] < 0.2 && // threshold for similarity
    results.documents?.[0]?.[0]
  ) {
    return {
      text: results.documents[0][0],
      metadata: results.metadatas[0][0],
    };
  }

  return null;
}

export async function storeTicket(text, response) {
  const collection = await initCollection();
  // We still explicitly embed here for adding
  const embedding = await embedText(text);

  await collection.add({
    ids: [uuidv4()],
    documents: [text],
    embeddings: [embedding],
    metadatas: [{ response }],
  });
}
