// server/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Groq = require('groq-sdk');

// --- Import Middleware ---
const auth = require('./middleware/auth');
const admin = require('./middleware/admin');

// --- Configurations ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
const port = process.env.PORT || 5000;

// --- Socket.io Setup ---
// We wrap the express app with a standard HTTP server to attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Allow your frontend to connect
        methods: ["GET", "POST"]
    }
});

// --- Standard Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('plantpal_db');
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('garden_plants');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

// --- Multer for memory storage (RAM) ---
const upload = multer({ storage: multer.memoryStorage() });

// ===================================
//  REAL-TIME SOCKET HANDLER
// ===================================
io.on('connection', (socket) => {
    // console.log('Client connected:', socket.id);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        // Send an immediate welcome notification upon connection
        io.to(userId).emit('notification', {
            type: 'success',
            msg: '⚡ Connected to PlantPal Live Service'
        });
    });

    socket.on('disconnect', () => {
        // console.log('Client disconnected:', socket.id);
    });
});

// ===================================
//  AUTH ROUTES
// ===================================
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await db.collection('users').findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            username,
            email,
            password: hashedPassword,
            role: 'user', // Default role
            createdAt: new Date(),
        };
        const result = await db.collection('users').insertOne(newUser);
        const token = jwt.sign({ user: { id: result.insertedId, role: 'user' } }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await db.collection('users').findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ user: { id: user._id, role: user.role } }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.get('/api/auth', auth, async (req, res) => {
    try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ===================================
//  AI PLANT ROUTES
// ===================================

// --- Identify & Save (The "All-in-One" Endpoint) ---
app.post('/api/identify', [auth, upload.single('image')], async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image provided.' });

    try {
        // 1. Convert image to base64 for Plant.id API
        const b64 = Buffer.from(req.file.buffer).toString("base64");

        // 2. Call Plant.id to get the name
        const plantRes = await axios.post('https://api.plant.id/v2/identify',
            { images: [b64], plant_details: ['common_names', 'url'] },
            { headers: { 'Content-Type': 'application/json', 'Api-Key': process.env.PLANT_ID_API_KEY } }
        );

        const suggestion = plantRes.data.suggestions[0];
        if (!suggestion) return res.status(404).json({ error: 'Could not identify plant.' });

        // 3. Upload the *user's* original image to Cloudinary for permanent storage
        // We use a data URI to upload the buffer directly
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const uploadRes = await cloudinary.uploader.upload(dataURI, {
            folder: "plantpal_garden",
        });

        // 4. Save everything to MongoDB
        const newPlant = {
            userId: new ObjectId(req.user.id),
            commonName: suggestion.plant_details.common_names?.[0] || suggestion.plant_name,
            scientificName: suggestion.plant_name,
            imageUrl: uploadRes.secure_url, // The Cloudinary URL
            savedAt: new Date(),
        };

        await db.collection('garden_plants').insertOne(newPlant);

        res.json({ msg: 'Plant identified and saved!', plant: newPlant });

    } catch (error) {
        console.error('Identify Error:', error.message);
        res.status(500).json({ error: 'An error occurred during identification.' });
    }
});

// --- Health Check ---
app.post('/api/health', [auth, upload.single('image')], async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image provided.' });
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const healthRes = await axios.post('https://api.plant.id/v2/health_assessment',
            { images: [b64], disease_details: ["common_names", "description", "URL", "treatment"] },
            { headers: { 'Content-Type': 'application/json', 'Api-Key': process.env.PLANT_ID_API_KEY } }
        );
        res.json(healthRes.data);
    } catch (error) {
        console.error('Health Error:', error.message);
        res.status(500).json({ error: 'Error checking health.' });
    }
});

// --- RAG Chatbot (Powered by Groq) ---
app.post('/api/chat', auth, async (req, res) => {
    try {
        // 1. RAG: Fetch user's garden data for context
        const myPlants = await db.collection('garden_plants').find({ userId: new ObjectId(req.user.id) }).toArray();

        // Format the context string
        const gardenContext = myPlants.length > 0
            ? myPlants.map(p => p.commonName).join(", ")
            : "an empty garden";

        // 2. Call Groq API with the context-aware prompt
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    // This is the "persona" and RAG instruction
                    content: `You are PlantBot, a helpful gardening assistant. 
          CONTEXT: The user currently has these plants in their garden: ${gardenContext}. 
          INSTRUCTION: If the user asks about "my plants" or "my garden", use the CONTEXT above. Keep answers helpful, friendly, and concise (max 3 sentences if possible).`
                },
                {
                    role: "user",
                    content: req.body.message
                }
            ],
            model: "llama-3.1-8b-instant", // Very fast, free model on Groq
        });

        // 3. Send back the AI's response
        res.json({ reply: completion.choices[0]?.message?.content || "I'm not sure what to say." });

    } catch (error) {
        console.error('Groq Chat Error:', error);
        res.status(500).json({ reply: "I'm having trouble thinking right now. Please try again later!" });
    }
});

// ===================================
//  STANDARD CRUD ROUTES
// ===================================
app.get('/api/garden', auth, async (req, res) => {
    try {
        const plants = await db.collection('garden_plants')
            .find({ userId: new ObjectId(req.user.id) })
            .sort({ savedAt: -1 })
            .toArray();
        res.json(plants);
    } catch (err) { res.status(500).send('Server Error'); }
});

app.delete('/api/garden/:id', auth, async (req, res) => {
    try {
        await db.collection('garden_plants').deleteOne({ _id: new ObjectId(req.params.id), userId: new ObjectId(req.user.id) });
        res.json({ msg: 'Plant removed' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// ===================================
//  PROFILE & ADMIN ROUTES
// ===================================
app.put('/api/profile', auth, async (req, res) => {
    try {
        const updated = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(req.user.id) },
            { $set: { username: req.body.username } },
            { returnDocument: 'after', projection: { password: 0 } }
        );
        res.json(updated.value);
    } catch (err) { res.status(500).send('Server Error'); }
});

app.post('/api/profile/picture', [auth, upload.single('image')], async (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded.' });
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to a specific 'profiles' folder, overwrite old pic if it exists
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "plantpal_profiles",
            public_id: req.user.id,
            overwrite: true,
            width: 150, height: 150, crop: 'fill' // Auto-crop to square
        });

        const updated = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(req.user.id) },
            { $set: { profilePictureUrl: result.secure_url } },
            { returnDocument: 'after', projection: { password: 0 } }
        );
        res.json(updated.value);
    } catch (err) { res.status(500).send('Server Error'); }
});

app.get('/api/admin/users', [auth, admin], async (req, res) => {
    try {
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (err) { res.status(500).send('Server Error'); }
});

// --- ADMIN STATS (Aggregations for Charts) ---
app.get('/api/admin/stats', [auth, admin], async (req, res) => {
    try {
        const userCount = await db.collection('users').countDocuments();
        const plantCount = await db.collection('garden_plants').countDocuments();

        // Aggregate users by joining date
        const timeline = await db.collection('users').aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        // Aggregate most popular plants
        const popular = await db.collection('garden_plants').aggregate([
            { $group: { _id: "$commonName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]).toArray();

        res.json({
            counts: { users: userCount, plants: plantCount },
            timeline: timeline.map(t => ({ date: t._id, users: t.count })),
            popular: popular.map(p => ({ name: p._id, count: p.count }))
        });
    } catch (err) { res.status(500).send('Server Error'); }
});

// --- START SERVER ---
// IMPORTANT: We listen on 'server', not 'app', to enable Socket.io
connectDB().then(() => {
    server.listen(port, () => {
        console.log(`Server (HTTP + Socket.io) listening on port ${port}`);
    });
});