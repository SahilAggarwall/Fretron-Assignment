const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organization');
const userOrgRoutes = require('./routes/userOrg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/test'; // Replace with your MongoDB URI
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Organization routes
app.use('/api/organization', organizationRoutes); 

// UserOrg routes
app.use('/api/user-org', userOrgRoutes);

app.use(express.json());

app.post('/run-script', (req, res) => {
  const { message } = req.body;

  if (message === "Run googleSheets.js") {
    exec('node googleSheets.js', (err, stdout) => {
      if (err) {
        console.error(`Error executing script: ${err}`);
        return res.status(500).send('Error executing script');
      }

      console.log(`Script output: ${stdout}`);
      res.send('Script executed successfully');
    });
  } else {
    res.status(400).send('Invalid request');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
