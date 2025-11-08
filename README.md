PlantPal 🪴

Your AI-powered companion for plant care. Identify, check health, and manage your digital garden—all in real-time.

🟢 LIVE DEMO: https://plant-pal-ivory.vercel.app/

(Note: Replace the image above with a real screenshot of your dashboard for maximum impact)

📖 About

PlantPal is a full-stack MERN application built to help plant enthusiasts—from beginners to experts—manage their collection. It leverages multiple advanced AI services to instantly identify plants from photos, diagnose potential health issues, and provide a context-aware chatbot that knows exactly what's in your garden.

Built for a hackathon, this project features real-time WebSocket updates, AI-driven analytics, and a Retrieval-Augmented Generation (RAG) chatbot.

✨ Key Features

🤖 AI Plant Identification: Snap a photo, and our integrated AI (Plant.id) instantly identifies the species and saves it to your collection.

🩺 AI Health Check: Worried about yellow leaves? Upload a photo to get an instant diagnosis of potential diseases or pests.

💬 Real-time RAG Chatbot: Ask PlantBot anything! It's powered by Groq (Llama 3) and is "aware" of your specific garden. Ask "How do I water my plants?" and it will give advice based specifically on the species you own.

🏡 Digital Garden (CRUD): A personalized dashboard to view, manage, and delete plants from your collection.

⚡ Real-time Notifications: instant alerts and welcome messages using Socket.io.

📊 Admin Analytics: A secure admin dashboard with beautiful charts (recharts) visualizing user growth and popular plant trends.

🔐 Secure Authentication: Robust login/signup system using JWT (JSON Web Tokens) and bcrypt password hashing.

👤 Profile Management: Users can update their profiles and upload custom avatars, stored securely in the cloud via Cloudinary.

🛠️ Tech Stack

Area

Technologies

Frontend

React.js, Vite, React Bootstrap, Recharts, Socket.io-client, Chatscope UI

Backend

Node.js, Express.js, Socket.io, JWT, Multer

Database

MongoDB Atlas (NoSQL)

AI & ML

Groq (Llama 3 8B for RAG Chatbot), Plant.id API (Identification & Health)

Cloud Services

Cloudinary (Image Storage), Render (Backend Hosting), Vercel (Frontend Hosting)

🤖 AI Integration & Declaration

Transparency in AI usage is core to this project. Here is exactly how we leveraged Artificial Intelligence:

1. In-App AI (Core Features)

Groq (Llama 3 8B): Powers the Real-time RAG Chatbot.

Implementation: The Node.js server fetches the user's current plant list from MongoDB and injects it as "context" into the Llama 3 system prompt. This allows the AI to give personalized advice without needing fine-tuning.

Plant.id API: Powers the Identification and Health Check features.

Implementation: User-uploaded images are converted to base64 and sent to Plant.id's machine learning endpoints for analysis.

2. Development Assistance

Google Gemini: Used by the development team as an intelligent assistant.

Usage: Gemini aided in generating boilerplate code for Redux/Context API setup, debugging complex CORS issues between Render/Vercel, and optimizing MongoDB aggregation pipelines for the admin dashboard.

🚀 Local Setup Guide

If you want to run this project locally:

Clone the repository

git clone [https://github.com/BLESSEDSAMUELES/PlantPal.git](https://github.com/BLESSEDSAMUELES/PlantPal.git)
cd PlantPal


Setup Backend

cd server
npm install
# Create a .env file with the following keys:
# MONGO_URI=your_mongodb_url
# JWT_SECRET=your_secret
# PLANT_ID_API_KEY=your_key
# GROQ_API_KEY=your_key
# CLOUDINARY_CLOUD_NAME=your_name
# CLOUDINARY_API_KEY=your_key
# CLOUDINARY_API_SECRET=your_secret
node server.js


Setup Frontend

# Open a new terminal
cd client
npm install
npm run dev
