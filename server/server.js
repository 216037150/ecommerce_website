const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const dbName = process.env.DB_NAME || "customer";
const collectionName = "Users";

const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error(err);
    }
}
connectToDatabase();

// Serve static files
app.use('/images', express.static(path.join(__dirname, '../images'))); // Serve all files in the images directory
app.use('/css', express.static(path.join(__dirname, '../client'))); // Serve CSS files
app.use('/client', express.static(path.join(__dirname, '../client'))); // Serve HTML and JS files

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/register.html'));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/login.html'));
});

app.get("/index", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    } else {
        res.redirect('/login');
    }
});

// Registration route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const db = client.db(dbName);
    const users = db.collection(collectionName);

    try {
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
        await users.insertOne({ username, email, password });
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = client.db(dbName);
    const users = db.collection(collectionName);

    try {
        const user = await users.findOne({ username, password });
        if (!user) {
            return res.status(400).send('Invalid credentials');
        }
        req.session.user = { username: user.username, email: user.email };
        res.redirect('/index');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Fetch data route
app.get('/api/users', async (req, res) => {
    const db = client.db(dbName);
    const users = db.collection(collectionName);

    try {
        const userData = await users.find({}).toArray();
        res.json(userData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Serve ViewData.html
app.get("/viewdata", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/ViewData.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
