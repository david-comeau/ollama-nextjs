# Ollama Next.js Chroma Project

Run a local LLM in Docker using Next.js, Ollama & Chroma for Retrieval-Augmented Generation (RAG) support.

This runs the [orca-mini:3b model](https://ollama.com/library/orca-mini:3b).

*A general-purpose model ranging from 3 billion parameters to 70 billion, suitable for entry-level hardware.*

If you have more memory, try
 - llama2
 - llama2:7b
 - llama2:3b

`OLLAMA_MODEL` set in `.env.development`

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

At this point, Ollama & Chroma should be up and running in Docker.

Test Ollama by running

`curl -X POST http://localhost:11434/api/generate -d '{"model": "orca-mini:3b", "prompt": "Hello, world!"}'`

Be sure to update `"model": "orca-mini:3b"` if you're running a different model.

Test Chroma by running

`curl http://localhost:8000/api/v1/heartbeat`

### Populate Chroma

`npm run populate-chroma`

This uses test CSV data located in `/data/organizations.csv`

See `.env.development` to set `CSV_FILENAME` & `CHROMA_COLLECTION_NAME`

Chroma is queried at prompt time, and the results are sent to Ollama as context along with the prompt.

### Start the Next.js development server

`npm run dev`

The app should be avalable on [http://localhost:3000/](localhost:3000)