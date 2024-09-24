const { config } = require('dotenv');
const path = require('path');

// Load the appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

config({ path: path.resolve(process.cwd(), envFile) });

console.log(`Loaded environment variables from ${envFile}`);