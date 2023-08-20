const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import your User model here
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON data in requests

const port = process.env.PORT || 5000;

// Connect to MongoDB (mydb)
const mongoURIMyDB = process.env.MONGODB_URI_MYDB;
const mongoURIMyBlogs = process.env.MONGODB_URI_MYBLOGS;

mongoose.connect(mongoURIMyDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB (mydb)');
})
.catch(error => {
  console.error('Error connecting to MongoDB (mydb):', error);
});

mongoose.connect(mongoURIMyBlogs, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB (myblogs)');
})
.catch(error => {
  console.error('Error connecting to MongoDB (myblogs):', error);
});


// Models for collections (ageofai, devtools, webdev, road, tools, working, and User)
const AgeOfAI = mongoose.model('ageofai', {
  title: String,
  overview: [String],
  keypoints: [String],
});

const DevTools = mongoose.model('devtools', {
  title: String,
  overview: [String],
  CourseDetails: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});

const WebDev = mongoose.model('webdev', {
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
});

const Road = mongoose.model('road', {
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
});

const Tools = mongoose.model('tools', {
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});
const Working = mongoose.model('working', {
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});


// Routes for all collections
app.get('/api/:collection', async (req, res) => {
  const collection = req.params.collection;
  try {
    let data;
    switch (collection) {
      case 'ageofai':
        data = await AgeOfAI.find().lean();
        break;
      case 'devtools':
        data = await DevTools.find().lean();
        break;
      case 'webdev':
        data = await WebDev.find().lean();
        break;
      case 'road':
        data = await Road.find().lean();
        break;
      case 'tools':
     
        data = await Tools.find().lean();
        break;
      case 'working':
     
        data = await Working.find().lean();
        break;
      default:
        return res.status(404).json({ error: 'Collection not found' });
    }
    console.log('Data fetched successfully from', collection, 'collection:', data);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching data from ${collection} collection:`, error);
    res.status(500).json({ error: `Error fetching data from ${collection} collection` });
  }
});

// Serving static images and videos
app.use('/api/images', express.static('E:\\Dev Projects\\workREwork\\src\\assets'));
app.use('/api/videos', express.static('E:\\Dev Projects\\workREwork\\src\\assets'));

// Signup route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: 'Signup successful' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'An error occurred during signup' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// ...

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to My API');
});

// Not Found route
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Listen for MongoDB collection events
mongoose.connection.on('collection', (collectionName) => {
  console.log(`Collection ${collectionName} changed.`);
});
