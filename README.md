# VISIONIQ

AI-powered crowd monitoring and analytics system with real-time object detection.

## Prerequisites

- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **Supabase Account** (for authentication)

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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
- Supabase authentication

## Project Structure

```
VISIONIQ/
├── backend/          # Flask API with YOLOv8
├── components/       # React components
├── services/         # API and auth services
└── types.ts          # TypeScript definitions
```
