# VISIONIQ - AI-Powered Video Analytics Platform

VISIONIQ is a comprehensive video analytics solution designed to transform standard video feeds into actionable intelligence. By leveraging state-of-the-art computer vision models, the platform provides real-time object detection and analysis, making it suitable for a wide range of security and operational applications.

## Real-World Applications

This platform is built to solve practical problems across various industries:

*   **Security & Surveillance**: Automate the monitoring of restricted areas by detecting unauthorized personnel or vehicles in real-time, reducing the need for constant manual supervision.
*   **Retail Analytics**: Analyze foot traffic patterns and customer behavior in stores to optimize layout and staffing, ultimately improving the customer experience.
*   **Industrial Safety**: Monitor manufacturing floors to ensure safety compliance, such as detecting workers entering hazardous zones or ensuring proper protective gear is worn.
*   **Smart City Management**: Assist in traffic flow analysis and crowd management during large events to enhance public safety and urban planning.

## Key Features

*   **Real-Time Detection**: Processes live video streams with low latency to identify objects and events as they happen.
*   **Secure Authentication**: Robust user management system ensures that only authorized personnel can access sensitive data and configuration settings.
*   **Interactive Dashboard**: A clean, intuitive interface that visualizes detection data, providing clear insights at a glance.
*   **Scalable Architecture**: Built with a modular design that allows for easy expansion and integration with existing camera infrastructure.

## Technology Stack

The project utilizes a modern, robust technology stack to ensure performance and maintainability:

### Frontend
*   **React**: For building a dynamic and responsive user interface.
*   **Vite**: Ensures fast build times and a smooth development experience.
*   **TypeScript**: Adds type safety to the codebase, reducing errors and improving code quality.
*   **TailwindCSS**: Provides a utility-first approach to styling for a custom, professional look.

### Backend
*   **Flask**: A lightweight and flexible Python web framework for serving the API and handling requests.
*   **SQLAlchemy**: ORM for efficient and secure database interactions.
*   **YOLOv8**: The latest iteration of the You Only Look Once algorithm, delivering state-of-the-art accuracy and speed in object detection.
*   **OpenCV**: Used for advanced image processing and video stream manipulation.

## Getting Started

Follow these steps to set up the project locally for development or testing.

### Prerequisites
*   **Node.js** (v18 or higher)
*   **Python** (v3.10 or higher)
*   **Git**

### Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd VISIONIQ
    ```

2.  **Backend Setup**
    Navigate to the backend directory and set up the Python environment.
    ```bash
    cd backend
    python -m venv .venv
    # Activate virtual environment:
    # Windows: .venv\Scripts\activate
    # Mac/Linux: source .venv/bin/activate
    pip install -r requirements.txt
    ```
    Create a `.env` file in the `backend` directory with your configuration (e.g., `DATABASE_URL`, `SECRET_KEY`).

3.  **Frontend Setup**
    Navigate to the root directory (or frontend directory if separate) and install dependencies.
    ```bash
    cd ..
    npm install
    ```
    Create a `.env` file in the root directory if required for frontend keys (e.g., API endpoints).

### Running the Application

1.  **Start the Backend Server**
    In the backend directory with the virtual environment activated:
    ```bash
    python app.py
    ```
    The server will start on `http://localhost:5000`.

2.  **Start the Frontend Development Server**
    In the root directory:
    ```bash
    npm run dev
    ```
    Access the application at `http://localhost:5173`.

## API Reference

*   `GET /health`: Check the status of the API and model loading.
*   `POST /api/register`: Register a new user account.
*   `POST /api/login`: Authenticate a user and receive an access token.
*   `POST /detect`: Submit an image frame for object detection.
