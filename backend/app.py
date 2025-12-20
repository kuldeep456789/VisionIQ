import base64
import cv2
import numpy as np
import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from ultralytics import YOLO
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
# Reduce Flask's werkzeug logging noise
logging.getLogger('werkzeug').setLevel(logging.ERROR)

# Initialize Flask app
app = Flask(__name__)
CORS(app, 
     origins=['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:8001', 'http://127.0.0.1:8001'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
)

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:8001', 'http://127.0.0.1:8001']:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        # Create users table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT,
                profile_picture TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Create detections table (optional, for logging)
        cur.execute('''
            CREATE TABLE IF NOT EXISTS detections (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                image_url TEXT,
                results JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    finally:
        cur.close()
        conn.close()

# Initialize DB
init_db()

# Load YOLO model
MODEL_PATH = 'yolov8m.pt'
model = None

try:
    if not os.path.exists(MODEL_PATH):
        logger.info(f"Model file '{MODEL_PATH}' not found locally. Downloading from Ultralytics...")
    
    logger.info(f"Loading YOLO model from {MODEL_PATH}...")
    model = YOLO(MODEL_PATH)
    logger.info("✅ YOLO model loaded successfully.")
except Exception as e:
    logger.error(f"❌ Failed to load YOLO model: {e}")
    model = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server and model status"""
    status = 'healthy' if model else 'model_not_loaded'
    return jsonify({
        'status': status,
        'model': MODEL_PATH,
        'model_loaded': model is not None,
        'db_connected': get_db_connection() is not None
    }), 200

@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', 'User')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Use werkzeug for password hashing
    try:
        hashed_password = generate_password_hash(password)
    except Exception as e:
        logger.error(f"Hashing error: {e}")
        return jsonify({'error': 'Password processing failed'}), 500
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (email, password, name) VALUES (%s, %s, %s) RETURNING id",
            (email, hashed_password, name)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'name': name
            }
        }), 201
    except psycopg2.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if user and check_password_hash(user['password'], password):
            token = jwt.encode({
                'user_id': user['id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
            }, JWT_SECRET, algorithm='HS256')
            
            return jsonify({
                'token': token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()
        conn.close()
@app.route('/detect', methods=['POST', 'OPTIONS'])
def detect():
    """
    Object detection endpoint
    Expects JSON: { "image": "base64_encoded_image_string" }
    Returns: Array of detections with labels and bounding boxes
    """
    if request.method == 'OPTIONS':
        return '', 204
        
    if model is None:
        logger.error("Model not loaded")
        return jsonify({'error': 'Model not loaded. Please restart the server.'}), 503
    try:
        # Get JSON data from request
        data = request.json
        
        # Validate request data
        if not data or 'image' not in data:
            logger.warning("No image provided in request")
            return jsonify({'error': 'No image provided. Expected JSON with "image" field.'}), 400

        # Decode base64 image
        try:
            image_data = base64.b64decode(data['image'])
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            logger.error(f"Image decoding failed: {e}")
            return jsonify({'error': f'Failed to decode image: {str(e)}'}), 400

        # Check if image was decoded successfully
        if img is None:
            logger.error("Decoded image is None - invalid image format")
            return jsonify({'error': 'Invalid image format. Please provide a valid base64-encoded image.'}), 400

        # Get image dimensions
        height, width, channels = img.shape
        logger.info(f"Processing image: {width}x{height}x{channels}")

        # Run YOLO inference
        logger.info("Running YOLO inference...")
        results = model(img, conf=0.15, verbose=False)  # Added verbose=False to reduce logs

        # Parse detections
        detections = []
        for result in results:
            boxes = result.boxes
            logger.info(f"Detected {len(boxes)} objects")
            
            for box in boxes:
                # Get bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Normalize coordinates (0-1 range)
                x = x1 / width
                y = y1 / height
                w = (x2 - x1) / width
                h = (y2 - y1) / height
                
                # Get class label and confidence
                cls = int(box.cls[0])
                label = model.names[cls]
                confidence = float(box.conf[0])
                
                detections.append({
                    'label': label,
                    'confidence': round(confidence, 2),
                    'box': {
                        'x': round(x, 4),
                        'y': round(y, 4),
                        'width': round(w, 4),
                        'height': round(h, 4)
                    }
                })
        
        # Custom JSON encoder for numpy types
        def json_serializer(obj):
            if isinstance(obj, (np.float32, np.float64)):
                return float(obj)
            if isinstance(obj, (np.int32, np.int64)):
                return int(obj)
            raise TypeError(f"Type {type(obj)} not serializable")

        import json
        
        # Save to database
        user_id = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                user_id = payload.get('user_id')
            except Exception as e:
                logger.warning(f"Invalid token during detection: {e}")

        try:
            conn = get_db_connection()
            if conn:
                cur = conn.cursor()
                cur.execute(
                    "INSERT INTO detections (user_id, results, created_at) VALUES (%s, %s, NOW())",
                    (user_id, json.dumps(detections, default=json_serializer))
                )
                conn.commit()
                cur.close()
                conn.close()
                logger.info(f"Saved detection results for user_id={user_id}")
        except Exception as e:
            logger.error(f"Failed to save detection to DB: {e}")

        logger.info(f"✅ Returning {len(detections)} detections")
        return jsonify(detections), 200

    except Exception as e:
        logger.error(f"❌ Unexpected error during detection: {e}", exc_info=True)
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
@app.route('/stats', methods=['GET'])
def get_stats():
    """Optional: Get detection statistics"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 503
    
    return jsonify({
        'model_name': MODEL_PATH,
        'classes': list(model.names.values()),
        'total_classes': len(model.names)
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)