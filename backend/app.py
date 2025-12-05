import base64
import cv2
import numpy as np
import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from ultralytics import YOLO

# Load env vars from root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Database Config
# Default to sqlite if no URL provided, but warn for Neon
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    logger.warning("DATABASE_URL not found in .env. Using local sqlite for development.")
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local.db'
else:
    # Fix postgres:// to postgresql:// for SQLAlchemy if needed
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# User Model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name
        }

# Initialize DB
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

# Load YOLOv8 model
MODEL_PATH = 'yolov8m.pt'
try:
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"Model file '{MODEL_PATH}' not found locally. It will be downloaded.")
    
    logger.info(f"Loading YOLO model from {MODEL_PATH}...")
    # Using 'yolov8m.pt' (medium) for better accuracy than 'yolov8n.pt' (nano)
    model = YOLO(MODEL_PATH)
    logger.info("YOLO model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {e}")
    model = None

@app.route('/health', methods=['GET'])
def health_check():
    status = 'healthy' if model else 'partial_outage_model_failed'
    return jsonify({'status': status, 'model': MODEL_PATH}), 200

# Auth Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', 'User')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    new_user = User(email=email, name=name)
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        return jsonify({'message': 'Login successful', 'user': user.to_dict()}), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/detect', methods=['POST'])
def detect():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 503

    try:
        data = request.json
        if not data or 'image' not in data:
            logger.warning("No image provided in request")
            return jsonify({'error': 'No image provided'}), 400

        # Decode base64 image
        try:
            image_data = base64.b64decode(data['image'])
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            logger.error(f"Image decoding failed: {e}")
            return jsonify({'error': 'Failed to decode image'}), 400

        if img is None:
            logger.error("Decoded image is None")
            return jsonify({'error': 'Failed to decode image'}), 400

        # Run inference
        logger.info("Running inference...")
        # Lower confidence threshold to 0.15 to detect more objects (improves recall)
        results = model(img, conf=0.15)

        detections = []
        for result in results:
            boxes = result.boxes
            logger.info(f"Detected {len(boxes)} objects")
            for box in boxes:
                # Get box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Normalize coordinates
                height, width, _ = img.shape
                x = x1 / width
                y = y1 / height
                w = (x2 - x1) / width
                h = (y2 - y1) / height

                # Get label
                cls = int(box.cls[0])
                label = model.names[cls]

                detections.append({
                    'label': label,
                    'box': {
                        'x': x,
                        'y': y,
                        'width': w,
                        'height': h
                    }
                })
        
        logger.info(f"Returning {len(detections)} detections")
        return jsonify(detections)

    except Exception as e:
        logger.error(f"Unexpected error during detection: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
