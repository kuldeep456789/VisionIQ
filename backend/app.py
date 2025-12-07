import base64
import cv2
import numpy as np
import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from ultralytics import YOLO
from supabase import create_client, Client

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logging.getLogger('werkzeug').setLevel(logging.ERROR)

app = Flask(__name__)
CORS(app)

supabase_url = os.environ.get('VITE_SUPABASE_URL')
supabase_key = os.environ.get('VITE_SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    logger.warning("Supabase credentials not found in .env. Some features may not work.")
    supabase: Client = None
else:
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        logger.debug("Supabase client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        supabase = None

MODEL_PATH = 'yolov8m.pt'
try:
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"Model file '{MODEL_PATH}' not found locally. It will be downloaded.")
    
    logger.debug(f"Loading YOLO model from {MODEL_PATH}...")
    model = YOLO(MODEL_PATH)
    logger.debug("YOLO model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {e}")
    model = None

@app.route('/health', methods=['GET'])
def health_check():
    status = 'healthy' if model else 'partial_outage_model_failed'
    return jsonify({'status': status, 'model': MODEL_PATH}), 200


@app.route('/detect', methods=['POST'])
def detect():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 503

    try:
        data = request.json
        if not data or 'image' not in data:
            logger.warning("No image provided in request")
            return jsonify({'error': 'No image provided'}), 400

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

        logger.info("Running inference...")
        results = model(img, conf=0.15)

        detections = []
        for result in results:
            boxes = result.boxes
            logger.info(f"Detected {len(boxes)} objects")
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                height, width, _ = img.shape
                x = x1 / width
                y = y1 / height
                w = (x2 - x1) / width
                h = (y2 - y1) / height
                
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
    
    from flask import cli
    cli.show_server_banner = lambda *_: None
    
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        print(f"Flask server running on port {port}....")
    app.run(host='0.0.0.0', port=port, debug=True)
