
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

function logRequest(req, res, next) {
  const time = new Date().toISOString();
  console.log(time, req.method, req.url);
  next();
}
app.use(logRequest);

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/images', (req, res) => {
  res.status(404).send('Image not found');
});

async function startServer() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('afterschool');
    const lessonsCollection = db.collection('lessons');
    const ordersCollection = db.collection('orders');

    app.get('/lessons', async (req, res) => {
      const lessons = await lessonsCollection.find({}).toArray();
      res.json(lessons);
    });

    app.post('/orders', async (req, res) => {
      try {
        const order = req.body || {};
        if (!order.name || !order.phone || !Array.isArray(order.items)) {
          return res.status(400).json({ error: 'Name, phone, and items are required' });
        }

        const result = await ordersCollection.insertOne(order);
        res.status(201).json({ insertedId: result.insertedId });
      } catch (error) {
        console.error('Failed to save order:', error);
        res.status(500).json({ error: 'Failed to save order' });
      }
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server started on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or start the server:', error);
  }
}

startServer();
