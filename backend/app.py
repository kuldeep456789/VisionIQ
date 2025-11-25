import base64
import cv2
import numpy as np
import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

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
    raise e

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model': MODEL_PATH}), 200

@app.route('/detect', methods=['POST'])
def detect():
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
