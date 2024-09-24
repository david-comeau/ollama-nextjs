import { initializeChromaCollection, queryChromaCollection } from '@/utils/chromaUtils';
import { getOllamaResponse, processOllamaStream } from '@/utils/ollamaUtils';

let collection;

const HTTP_METHODS = {
  POST: 'POST'
};

const HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive'
};

export default async function handler(req, res) {
  if (req.method !== HTTP_METHODS.POST) {
    res.setHeader('Allow', [HTTP_METHODS.POST]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    if (!collection) {
      collection = await initializeChromaCollection();
    }

    res.writeHead(200, HEADERS);

    const { prompt } = req.body;
    const documents = await queryChromaCollection(collection, prompt);
    const context = JSON.stringify(documents, null, 2);
    const augmentedPrompt = `Based on the following context:\n${context}\n\nAnswer the following question: ${prompt}`;

    const ollamaResponse = await getOllamaResponse(augmentedPrompt);
    await processOllamaStream(ollamaResponse.data, res);

  } catch (error) {
    console.error('Error in API route:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream error', details: error.message })}\n\n`);
      res.end();
    }
  }
}