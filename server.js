
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
    
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('afterschool');
    const lessonsCollection = db.collection('lessons');

    app.get('/lessons', async (req, res) => {
      const lessons = await lessonsCollection.find({}).toArray();
      res.json(lessons);
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server started on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or start the server:', error);
  }
}

startServer();
