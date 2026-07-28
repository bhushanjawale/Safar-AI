# 🌍 Safar AI – AI-Powered Travel Planning Web Application

<p align="center">
AI-powered travel planning platform built using Flask, Firebase, Google Gemini AI, and Groq AI.
</p>

---

## 📖 About the Project

Safar AI is an intelligent travel planning web application that helps users plan trips with the power of Artificial Intelligence.

The application generates personalized itineraries, recommends destinations, searches hotels and flights, provides an AI travel assistant, and allows users to manage their wishlist—all through a modern and user-friendly interface.

---

## ✨ Features

- 🔐 Secure User Authentication (Firebase)
- 🤖 AI Trip Planner
- 💬 AI Travel Chat Assistant
- 📍 Destination Recommendations
- 🗺️ Personalized Day-wise Itinerary
- ✈️ Flight Search
- 🏨 Hotel Search
- ❤️ Wishlist Management
- 📸 Destination Images (Pexels API)
- 📱 Responsive Design

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Python, Flask |
| Database | Firebase Firestore |
| Authentication | Firebase Authentication |
| AI | Google Gemini API, Groq API |
| Images | Pexels API |

---

## 📂 Project Structure

```text
Safar-AI/
│
├── css/
├── js/
├── routes/
├── templates/
├── screenshots/
├── app.py
├── requirements.txt
├── .env
├── README.md
└── ...
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/yourusername/Safar-AI.git
cd Safar-AI
```

---

### Create Virtual Environment

Windows

```bash
python -m venv venv
venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Configure Environment Variables

Create a `.env` file inside the project directory.

```env
GEMINI_API_KEY=YOUR_API_KEY
GROQ_API_KEY=YOUR_API_KEY
FIREBASE_API_KEY=YOUR_FIREBASE_KEY
```

---

### Run the Application

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000
```

---

# 🏗️ System Architecture

```text
                User
                  │
                  ▼
      Frontend (HTML/CSS/JavaScript)
                  │
                  ▼
           Flask Backend (Python)
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
 Google Gemini   Groq   Firebase
        │                   │
        └─────────┬─────────┘
                  ▼
         Travel Recommendation
            & AI Itinerary
```

---

# 🔮 Future Enhancements

- 💭 AI Based ChatBot Assistant
- 🌎 Multi-language Support
- ☁️ Real-time Weather Integration
- 💰 Smart Budget Optimizer
- 📅 Trip Sharing
- 📄 PDF Itinerary Download
- 📍 Offline Travel Guide

---

# 👨‍💻 Developer

Bhushan Sunil Jawale

---

# 📜 License

This project was developed for educational and learning purposes.

---

# ⭐ Support

If you found this project helpful, please consider giving it a **⭐ Star** on GitHub.
