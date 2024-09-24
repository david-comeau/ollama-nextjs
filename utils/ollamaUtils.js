import axios from 'axios';

export async function getOllamaResponse(prompt) {
  return axios.post('http://localhost:11434/api/generate',
    {
      model: process.env.OLLAMA_MODEL,
      prompt: prompt,
      stream: true
    },
    { responseType: 'stream' }
  );
}

export async function processOllamaStream(stream, res) {
  let buffer = '';
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      buffer += chunk.toString();
      let jsonEndIndex;
      while ((jsonEndIndex = buffer.indexOf('}')) !== -1) {
        const jsonStr = buffer.slice(0, jsonEndIndex + 1);
        buffer = buffer.slice(jsonEndIndex + 1);
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.response) {
            const sseData = `data: ${JSON.stringify({ text: parsed.response })}\n\n`;
            res.write(sseData);
          }
          if (parsed.done) {
            const sseData = `data: ${JSON.stringify({ done: true })}\n\n`;
            res.write(sseData);
          }
        } catch (e) {
          console.error('Error parsing Ollama response:', e, 'JSON string:', jsonStr);
          res.write(`data: ${JSON.stringify({ error: 'Error parsing Ollama response', details: e.message })}\n\n`);
        }
      }
    });

    stream.on('end', () => {
      if (buffer.trim() !== '') {
        res.write(`data: ${JSON.stringify({ error: 'Unprocessed data', details: buffer })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      resolve();
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Stream error', details: error.message })}\n\n`);
      reject(error);
    });
  });
}