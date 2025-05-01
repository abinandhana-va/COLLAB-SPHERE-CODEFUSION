const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import routes

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const projectRoutes = require('./routes/projects');
const discussionRoutes = require('./routes/discussion');


const app = express();
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/projects', require('./routes/projects'));





// Console logs for debugging
console.log('Current working directory:', process.cwd());


// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/discussions', discussionRoutes);

// Route to serve specific HTML files
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/profile.html'));
});

app.get('/creator-profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/creator-profile.html'));
});

app.get('/contributor-profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/contributor-profile.html'));
});

app.get('/select-role', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/select-role.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/projects.html'));
});

app.get('/discussions', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/discussions.html'));
});

// **New API Endpoint to Get User by ID for Username Parts**
app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Assuming your User model is already defined in one of your route files
        // or a separate models directory. You might need to import it here if not.
        const User = mongoose.model('User'); // Adjust the model name if necessary

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ username: user.username });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Home page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Catch-all route for any unmatched routes (should be last)
app.get('/*path', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas', err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});