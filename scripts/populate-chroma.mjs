import { ChromaClient } from 'chromadb';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromaClient = new ChromaClient({ path: "http://localhost:8000" });
const csvFilePath = path.resolve(process.cwd(), 'data', process.env.CSV_FILENAME || 'default.csv');
const collectionName = process.env.CHROMA_COLLECTION_NAME || 'default_collection';

console.log('CSV File:', csvFilePath);
console.log('Collection Name:', collectionName);

async function populateChromaFromCSV(filePath, collectionName) {
  let collection;
  try {
    collection = await chromaClient.getOrCreateCollection({
      name: collectionName
    });
    console.log('Collection created/retrieved successfully');
    const initialCount = await collection.count();
    console.log(`Initial count in collection: ${initialCount}`);
  } catch (error) {
    console.error('Error creating/getting collection:', error);
    return;
  }

  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`CSV file successfully processed. Total rows: ${results.length}`);
        console.log('Sample rows:', results.slice(0, 3));

        for (let i = 0; i < results.length; i += 100) {
          const batch = results.slice(i, i + 100);
          const ids = batch.map(() => uuidv4());
          const documents = batch.map(row => JSON.stringify(row));
          const metadatas = batch.map(row => ({
            _document_length: JSON.stringify(row).length
          }));

          try {
            await collection.add({
              ids: ids,
              documents: documents,
              metadatas: metadatas
            });
            console.log(`Added batch ${i / 100 + 1}`);
            const currentCount = await collection.count();
            console.log(`Current count after batch ${i / 100 + 1}: ${currentCount}`);
          } catch (error) {
            console.error(`Error adding batch ${i / 100 + 1}:`, error);
          }
        }

        console.log('Finished populating Chroma collection');
        const finalCount = await collection.count();
        console.log(`Final count in collection: ${finalCount}`);

        if (finalCount > 0) {
          const queryResult = await collection.query({
            nResults: 5,
            queryTexts: [""]
          });
          console.log('Sample query result:', queryResult);
        }

        resolve();
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

async function main() {
  try {
    await populateChromaFromCSV(csvFilePath, collectionName);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();