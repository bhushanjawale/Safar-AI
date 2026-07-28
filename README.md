🌍 Safar AI – AI-Powered Travel Planning Web Application
📌 Project Overview

Safar AI is an AI-powered travel planning web application that helps users plan trips quickly and efficiently. It provides personalized travel itineraries, destination recommendations, AI travel assistance, flight and hotel search, and wishlist management through an easy-to-use interface.

The application combines Google Gemini AI, Groq LLM, Firebase, and Flask to provide intelligent travel planning for users.

✨ Features
🔐 User Authentication (Firebase)
🤖 AI Trip Planner
💬 AI Travel Chat Assistant
🗺️ Personalized Travel Itineraries
✈️ Flight Search
🏨 Hotel Search
❤️ Wishlist Management
📍 Nearby Attractions
🌤️ Destination Recommendations
📱 Responsive User Interface
🔥 Firebase Database Integration
🛠️ Tech Stack
Frontend
HTML5
CSS3
JavaScript
Backend
Python
Flask
Database
Firebase Firestore
Authentication
Firebase Authentication
AI Services
Google Gemini API
Groq API
Other APIs
Pexels API
📂 Project Structure
Safar-AI/
│
├── assets/
├── css/
├── images/
├── js/
├── routes/
├── templates/
├── app.py
├── requirements.txt
├── .env
├── README.md
└── ...
🚀 Installation
1. Clone Repository
git clone https://github.com/yourusername/Safar-AI.git
cd Safar-AI
2. Create Virtual Environment

Windows

python -m venv venv
venv\Scripts\activate

Linux/Mac

python3 -m venv venv
source venv/bin/activate
3. Install Dependencies
pip install -r requirements.txt
4. Create Environment Variables

Create a .env file.

GEMINI_API_KEY=YOUR_API_KEY
GROQ_API_KEY=YOUR_API_KEY
FIREBASE_API_KEY=YOUR_FIREBASE_KEY
5. Run Flask Server
python app.py

Open

http://127.0.0.1:5000
🧠 How Safar AI Works
User
   │
   ▼
Frontend (HTML/CSS/JS)
   │
   ▼
Flask Backend
   │
   ├────────► Google Gemini AI
   │
   ├────────► Groq API
   │
   ├────────► Firebase Firestore
   │
   └────────► Pexels API
   │
   ▼
Travel Recommendation & Itinerary
📸 Screenshots

Add screenshots like

Home Page

Login Page

Dashboard

AI Trip Planner

Flight Search

Hotel Search

Wishlist

Chat Assistant

Example

![Home](screenshots/home.png)

![Planner](screenshots/planner.png)
🔮 Future Enhancements
Voice Assistant
Multi-language Support
Real-time Weather Integration
Budget Optimization
Offline Itinerary Access
AI Trip Sharing
Travel Expense Tracker

👨‍💻 Contributors
Bhushan Sunil Jawale

📜 License

This project is developed for educational and learning purposes.
