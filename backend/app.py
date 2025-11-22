import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Load YOLOv8 model
# Using 'yolov8m.pt' (medium) for better accuracy than 'yolov8n.pt' (nano)
model = YOLO('yolov8m.pt')

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
        print("Running inference...")
        # Lower confidence threshold to 0.15 to detect more objects (improves recall)
        # Use 'm' model for better accuracy
        results = model(img, conf=0.15)

        detections = []
        for result in results:
            boxes = result.boxes
            print(f"Detected {len(boxes)} objects")
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
        
        print(f"Returning {len(detections)} detections")
        return jsonify(detections)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server on port 5000...")
    app.run(debug=True, port=5000)
