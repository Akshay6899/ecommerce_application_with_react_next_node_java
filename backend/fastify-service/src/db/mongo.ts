import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let _db: Db;

export async function connectMongo() {
  const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DB || 'ecom';
  client = new MongoClient(url);
  await client.connect();
  _db = client.db(dbName);
  console.log(`✅ Mongo connected: ${dbName}`);
  return _db;
}

export function db(): Db {
  if (!_db) throw new Error('Mongo not connected — call connectMongo() first');
  return _db;
}
