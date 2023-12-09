const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
//
// DB connection
//const configJSON =JSON.parse(fs.readFileSync ('config.json', 'utf8'));
let configJSON;
let uri;
let dbName;
let client;
let db;
connectMongo('config.json').then((conf) => {
  configJSON = JSON.parse(conf);
  uri = configJSON.uri;
  dbName = configJSON.dbName;
  client = new MongoClient(uri);
  db = client.db(dbName);
});
//
async function connectMongo(fileConfig) {
  const conf = await fs.readFile(fileConfig, 'utf8');
  return Buffer.from(conf);
}

// перенести в main
// const uri = configJSON.uri;
// const dbName = configJSON.dbName;
// const collectionName = configJSON.collectionName;
// const client = new MongoClient(uri);
// const db = client.db(dbName);
//
//  fetch all records
async function fetchAll(Collection) {
  let documents;
  let collection = db.collection(Collection);
  try {
    await client.connect();
    // Find all documents in the collection
    const cursor = collection.find({}, { projection: { _id: 0 } });
    documents = await cursor.toArray();
    await cursor.close();
  } finally {
    await client.close();
    return documents;
  }
}

// fetchById
async function fetchById(Collection, id) {
  let document;
  const collection = db.collection(Collection);
  try {
    await client.connect();
    // Find all documents in the collection
    document = await collection.findOne({ id: id }, { projection: { _id: 0 } });
  } finally {
    await client.close();
    return document;
  }
}
// insert
async function insertOne(Collection, doc) {
  const collection = db.collection(Collection);
  const maxId = await fetchMaxId(Collection);
  if (maxId.length > 0) doc.id = parseInt(maxId[0].id) + 1;
  else doc.id = 1;
  let result = false;
  try {
    await client.connect();
    // Find all documents in the collection
    await collection.insertOne(doc).then(function (res) {
      result = res.acknowledged;
    });
    await client.close();
    return result;
  } catch (err) {
    console.log(err);
  }
}
// update
async function updateOne(Collection, id, doc) {
  const collection = db.collection(Collection);
  let result = false;
  try {
    await client.connect();
    // update document in the collection
    await collection.updateOne({ id: id }, { $set: doc }).then(function (res) {
      result = res.modifiedCount;
    });
    await client.close();
    return result;
  } catch (err) {
    console.log(err);
  }
}
// delete
async function deleteOne(Collection, id) {
  const doc = { id: id };
  const collection = db.collection(Collection);
  let result = false;
  try {
    await client.connect();
    // deleteOne by id document in the collection
    await collection.deleteOne(doc).then(function (res) {
      result = res.deletedCount;
    });
    await client.close();
    return result;
  } catch (err) {
    console.log(err);
  }
}
// Find max id field the collection
async function fetchMaxId(Collection) {
  let maxId;
  let collection = db.collection(Collection);
  try {
    await client.connect();
    const cursor = collection
      .find({}, { projection: { _id: 0, id: 1 } })
      .sort({ id: -1 })
      .limit(1);
    maxId = await cursor.toArray();
    await cursor.close();
  } finally {
    await client.close();
    return maxId;
  }
}
//
module.exports = { fetchAll, fetchById, insertOne, updateOne, deleteOne };
