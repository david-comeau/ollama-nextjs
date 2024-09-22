/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  }
};

export default nextConfig;
