const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// Basic route to test if server is running
app.get('/', (req, res) => {
  res.send('ROI Calculator API is running');
});

// Connect to MongoDB
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    isConnected = true;
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    throw error;
  }
};

// Lead submission endpoint
app.post('/api/leads', async (req, res) => {
  try {
    await connectToDatabase();
    
    const { email, inputs, results } = req.body;

    if (!email || !inputs || !results) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Received lead submission:', { email, inputs, results });
    
    const collection = mongoose.connection.collection('leads');
    const lead = {
      email,
      inputs,
      results,
      timestamp: new Date()
    };

    await collection.insertOne(lead);
    console.log('Lead saved successfully:', lead);
    
    res.status(200).json({ message: 'Lead saved successfully' });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// Only start the server if we're running locally
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export the app for Vercel
module.exports = app;