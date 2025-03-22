const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 3000;

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
app.use(bodyParser.json());
app.use(cors());

const dbName = 'PassLock';

client.connect();

// Get all passwords
app.get('/', async (req, res) => {
  const db = client.db(dbName);
  const collection = db.collection('passwords');
  const findResult = await collection.find({}).toArray();
  res.json(findResult);
});

app.post('/', async (req, res) => {
  const db = client.db(dbName);
  const collection = db.collection('passwords');

  const { id, ...data } = req.body; // Extract the id and other fields

  // Check if the password with the given id already exists
  const existingPassword = await collection.findOne({ id: id });

  if (existingPassword) {
    // Update the existing password
    const updateResult = await collection.updateOne(
      { id: id }, // Match by id
      { $set: data } // Update the fields, excluding _id
    );
    res.send({ success: true, action: 'updated', result: updateResult });
  } else {
    // Insert a new password
    const insertResult = await collection.insertOne(req.body);
    res.send({ success: true, action: 'created', result: insertResult });
  }
});

app.delete('/', async (req, res) => {
  const db = client.db(dbName);
  const collection = db.collection('passwords');
  const findResult = await collection.deleteOne({ id: req.body.id });
  res.send({ success: true, result: findResult });
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});