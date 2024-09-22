# Ollama Next.js Project For Running Local LLM in Docker

I've been wanting to learn more about LLMs, and it's a rainy Sunday, so why not?

This runs the [orca-mini:3b model](https://ollama.com/library/orca-mini:3b).

*A general-purpose model ranging from 3 billion parameters to 70 billion, suitable for entry-level hardware.*

If you have more memory, try
 - llama2
 - llama2:7b
 - llama2:3b

The model can bet set in `.env.development`

## Prerequisites

Ensure Docker and Git are installed on your local machine.
 - Docker -> https://docs.docker.com/get-started/get-docker/
 - Git -> https://git-scm.com/downloads

## Getting Started

Clone the repo

`git clone https://github.com/david-comeau/ollama-nextjs && cd ollama-nextjs`

### Build the Docker Image

1. Create .env file (needed to hydrate docker-compose):
   ```
   cp .env.development .env
   ```

2. Build the Docker image:
   ```
   docker-compose up -d
   ```

3. Watch the logs & wait for success.
   ```
   docker-compose logs -f
   ```

At this point, Ollama should be up and running in Docker. You can test by running

`curl -X POST http://localhost:11434/api/generate -d '{"model": "orca-mini:3b", "prompt": "Hello, world!"}'`

Be sure to update `"model": "orca-mini:3b"` if you're running a different model.

### Start the Next.js development server

`npm run dev`

The app should be avalable on [http://localhost:3000/](localhost:3000)

## TODO - Retrieval-Augmented Generation (RAG) Support.

1. Vector database (Chroma, Pinecone, or Faiss) to store document embeddings.

2. Create document embeddings.

3. Integrate with Ollama.