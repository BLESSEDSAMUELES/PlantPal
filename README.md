# PlantPal 🪴

### Your AI-powered companion for plant care. Identify, check health, and manage your digital garden—all in real-time.

[**🟢 LIVE DEMO: https://plant-pal-ivory.vercel.app/**](https://plant-pal-ivory.vercel.app/)

![PlantPal Dashboard](https://placehold.co/1200x600/e8f5e9/2e7d32?text=Add+Your+Dashboard+Screenshot+Here)
*(Note: Replace the image link above with a real screenshot of your dashboard!)*

---

## 📖 About

PlantPal is a full-stack MERN application designed to help users build and manage their personal plant collection. It leverages cutting-edge AI to instantly identify plants from photos, diagnose potential diseases, and offers a context-aware AI chatbot that knows exactly what's in your garden.

**Built for a hackathon, this project features real-time WebSocket updates, AI-driven analytics, and a Retrieval-Augmented Generation (RAG) chatbot.**

## ✨ Key Features

* **🤖 AI Plant Identification:** Snap a photo, and our integrated AI instantly identifies the species and automatically saves it to your personal garden collection.
* **🩺 AI Health Check:** Worried about yellow leaves? Upload a photo to get an instant diagnosis of potential diseases.
* **💬 Real-time RAG Chatbot:** Ask *PlantBot* anything! It's powered by **Groq (Llama 3)** and is "aware" of your specific garden. Ask "How do I water my plants?" and it gives personalized advice based on your actual collection.
* **🏡 Digital Garden (CRUD):** A personalized dashboard to view your collection in a clean table format, with options to manage and remove plants.
* **⚡ Real-time Notifications:** Get instant welcome messages and alerts via **Socket.io** when you connect.
* **📊 Admin Analytics:** A secure admin dashboard featuring beautiful charts (`recharts`) that visualize user growth and popular plant trends.
* **👤 Profile Management:** Users can update their profiles and upload custom avatars, which are automatically cropped and stored securely in the cloud via **Cloudinary**.
* **🔐 Secure Authentication:** Robust security with JWT (JSON Web Tokens) and bcrypt password hashing.

---

## 🛠️ Tech Stack

| Area | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, React Bootstrap, Recharts, Socket.io-client, Chatscope UI |
| **Backend** | Node.js, Express.js, Socket.io, JWT, Multer |
| **Database** | MongoDB Atlas |
| **AI & ML** | **Groq** (Llama 3 8B for RAG Chatbot), **Plant.id API** (Identification & Health) |
| **Cloud Services** | **Cloudinary** (Image Storage), **Render** (Backend Hosting), **Vercel** (Frontend Hosting) |

---

## 🤖 AI Integration & Declaration

Transparency in AI usage is core to this project. Here is exactly how we leveraged Artificial Intelligence:

### 1. In-App AI (Core Features)

* **Groq (Llama 3 8B):** Powers the **Real-time RAG Chatbot**.
    * *Implementation:* The Node.js server fetches the user's current plant list from MongoDB and injects it as "context" into the Llama 3 system prompt. This allows the AI to give personalized advice without needing fine-tuning.
* **Plant.id API:** Powers the **Identification** and **Health Check** features.
    * *Implementation:* User-uploaded images are converted to base64 and sent to Plant.id's machine learning endpoints for instant analysis.

### 2. Development Assistance

* **Google Gemini:** Used by the development team as an intelligent assistant during the hackathon.
    * *Usage:* Gemini aided in generating boilerplate code for the complex Socket.io setup, debugging CORS issues between deployment platforms, and optimizing MongoDB aggregation pipelines for the admin dashboard charts.

---

## 🚀 Local Setup Guide

If you want to run this project locally:

### 1. Clone the repository
```bash
git clone [https://github.com/BLESSEDSAMUELES/PlantPal.git](https://github.com/BLESSEDSAMUELES/PlantPal.git)
cd PlantPal
