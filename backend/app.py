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
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    import faiss
    from insightface.app import FaceAnalysis
except ImportError:
    faiss = None
    FaceAnalysis = None
    logger.warning("⚠️ faiss or insightface not installed. Face recognition features will be disabled.")
# Reduce Flask's werkzeug logging noise
logging.getLogger('werkzeug').setLevel(logging.ERROR)

# Initialize Flask app
app = Flask(__name__)

# Get allowed origins from env or use default localhosts
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:8000,http://127.0.0.1:8000,http://localhost:8001,http://127.0.0.1:8001').split(',')

CORS(app, 
     origins=allowed_origins,
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
        # Create visitors table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS visitors (
                id SERIAL PRIMARY KEY,
                name TEXT DEFAULT 'Unknown',
                embedding BYTEA,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                visit_count INTEGER DEFAULT 1,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

# Initialize Face Analysis (ArcFace)
face_app = None
try:
    logger.info("Initializing FaceAnalysis (ArcFace)...")
    face_app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
    face_app.prepare(ctx_id=0, det_size=(640, 640))
    logger.info("✅ FaceAnalysis initialized successfully.")
except Exception as e:
    logger.error(f"❌ Failed to initialize FaceAnalysis: {e}")

# FAISS Index setup
EMBEDDING_DIM = 512 # ArcFace buffalo_l produces 512-d embeddings
faiss_index = faiss.IndexFlatL2(EMBEDDING_DIM) if faiss else None
visitor_ids = [] # To map FAISS index to visitor DB IDs

def load_visitors_into_faiss():
    global visitor_ids
    if not faiss or not faiss_index:
        return
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, embedding FROM visitors WHERE embedding IS NOT NULL")
        rows = cur.fetchall()
        if rows:
            embeddings = []
            visitor_ids = []
            for row in rows:
                embedding = np.frombuffer(row[1], dtype=np.float32)
                embeddings.append(embedding)
                visitor_ids.append(row[0])
            
            if embeddings:
                faiss_index.reset()
                faiss_index.add(np.array(embeddings).astype('float32'))
                logger.info(f"Loaded {len(visitor_ids)} visitors into FAISS index.")
    except Exception as e:
        logger.error(f"Error loading visitors into FAISS: {e}")
    finally:
        conn.close()

load_visitors_into_faiss()

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
    Enhanced detection with tracking and visitor identification
    """
    if request.method == 'OPTIONS':
        return '', 204
        
    if model is None:
        logger.error("Model not loaded")
        return jsonify({'error': 'Model not loaded.'}), 503

    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided.'}), 400

        image_data = base64.b64decode(data['image'])
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': 'Invalid image format.'}), 400

        height, width, _ = img.shape
        
        # Use tracking if requested or by default for video
        # model.track returns results with .boxes.id
        results = model.track(img, persist=True, conf=0.25, verbose=False)
        
        detections = []
        
        # For Face Recognition, we'll also run FaceAnalysis on the whole frame
        # (Optimally we'd only run it on person crops, but insightface prefers the full frame context for detection)
        faces = []
        if face_app:
            faces = face_app.get(img)

        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls = int(box.cls[0])
                label = model.names[cls]
                confidence = float(box.conf[0])
                track_id = int(box.id[0]) if box.id is not None else None
                
                visitor_status = "Unknown"
                visitor_name = None
                
                # If it's a person, try to match with detected faces
                if label == 'person' and faces:
                    # Find face that falls within this person's bounding box
                    for face in faces:
                        fx1, fy1, fx2, fy2 = face.bbox.tolist()
                        # Simple overlap check
                        if fx1 >= x1 and fx2 <= x2 and fy1 >= y1 and fy2 <= y2:
                            embedding = face.embedding.astype('float32')
                            
                            # Search in FAISS
                            if faiss and faiss_index and faiss_index.ntotal > 0:
                                D, I = faiss_index.search(np.array([embedding]), 1)
                                if D[0][0] < 0.6: # Threshold for L2 distance (adjust as needed)
                                    v_id = visitor_ids[I[0][0]]
                                    visitor_status = "Returning Visitor"
                                    # Update last seen in DB
                                    conn = get_db_connection()
                                    if conn:
                                        cur = conn.cursor(cursor_factory=RealDictCursor)
                                        cur.execute("UPDATE visitors SET last_seen = NOW(), visit_count = visit_count + 1 WHERE id = %s RETURNING name", (v_id,))
                                        v_row = cur.fetchone()
                                        visitor_name = v_row['name'] if v_row else "Visitor"
                                        conn.commit()
                                        conn.close()
                                else:
                                    visitor_status = "New Visitor"
                                    # Add to DB
                                    conn = get_db_connection()
                                    if conn:
                                        cur = conn.cursor()
                                        cur.execute("INSERT INTO visitors (embedding) VALUES (%s) RETURNING id", (psycopg2.Binary(embedding.tobytes()),))
                                        new_id = cur.fetchone()[0]
                                        conn.commit()
                                        conn.close()
                                        # Refresh FAISS
                                        load_visitors_into_faiss()
                            else:
                                visitor_status = "New Visitor"
                                # First or no faiss
                                conn = get_db_connection()
                                if conn:
                                    cur = conn.cursor()
                                    cur.execute("INSERT INTO visitors (embedding) VALUES (%s) RETURNING id", (psycopg2.Binary(embedding.tobytes()),))
                                    new_id = cur.fetchone()[0]
                                    conn.commit()
                                    conn.close()
                                    load_visitors_into_faiss()
                            break # One face per person for now

                detections.append({
                    'label': label,
                    'confidence': round(confidence, 2),
                    'track_id': track_id,
                    'visitor_status': visitor_status,
                    'visitor_name': visitor_name,
                    'box': {
                        'x': round(x1 / width, 4),
                        'y': round(y1 / height, 4),
                        'width': round((x2 - x1) / width, 4),
                        'height': round((y2 - y1) / height, 4)
                    }
                })

        return jsonify(detections), 200

    except Exception as e:
        logger.error(f"Detection error: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500
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
    # Use environment variable for debug mode, default to False for production safety
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)