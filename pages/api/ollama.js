import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      });
      
      const response = await axios.post('http://localhost:11434/api/generate', 
        { ...req.body, model: process.env.OLLAMA_MODEL },
        { responseType: 'stream' }
      );

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        lines.forEach((line) => {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            res.write(`data: ${JSON.stringify({ text: parsed.response })}\n\n`);
          }
        });
      });

      response.data.on('end', () => {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      });

      response.data.on('error', (error) => {
        console.error('Error in stream:', error);
        res.write(`data: ${JSON.stringify({ error: 'Error in Ollama response stream' })}\n\n`);
        res.end();
      });

    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ error: 'Error communicating with Ollama', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}