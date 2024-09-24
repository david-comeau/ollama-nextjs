import { ChromaClient } from 'chromadb';

const chromaClient = new ChromaClient({ path: 'http://localhost:8000' });

export async function initializeChromaCollection() {
  try {
    return await chromaClient.getOrCreateCollection({
      name: process.env.CHROMA_COLLECTION_NAME
    });
  } catch (error) {
    console.error('Error initializing Chroma collection:', error);
    throw error;
  }
}

export async function queryChromaCollection(collection, prompt) {
  try {
    const result = await collection.query({
      queryTexts: [prompt],
      nResults: 5,
    });
    return result.documents?.[0].map(doc => JSON.parse(doc)) || [];
  } catch (error) {
    console.error('Error querying Chroma:', error);
    return [];
  }
}