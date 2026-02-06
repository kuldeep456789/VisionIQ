# VISIONIQ

AI-powered crowd monitoring and analytics system with real-time object detection.

## Prerequisites

- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **Neon Account** (PostgreSQL database)

## Setup

### 1. Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:8000`

### 3. Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The backend will run on `http://localhost:5000`

## Features

- Real-time camera monitoring
- Live object detection with YOLOv8
- Crowd analytics and heatmaps
- Alert system for security events
- Dark/Light theme support
- Neon (PostgreSQL) authentication and data storage

## Project Structure

```
VISIONIQ/
├── backend/          # Flask API with YOLOv8
├── components/       # React components
├── services/         # API and auth services
└── types.ts          # TypeScript definitions
```
