const express = require('express');
const mongoose = require('mongoose');
const userAuthRoutes = require('./routes/userAuth');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', userAuthRoutes);

async function startServer() {
  try {
    await mongoose.connect('mongodb://localhost:27017/budgetbuddy', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
}

startServer();

