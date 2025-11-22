import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Load YOLOv8 model
# 'yolov8n.pt' will be downloaded automatically if not present
model = YOLO('yolov8n.pt')

@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.json
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Failed to decode image'}), 400

        # Run inference
        results = model(img)

        detections = []
        for result in results:
            boxes = result.boxes
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

        return jsonify(detections)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
