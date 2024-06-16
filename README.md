# Wet Diabetes Prediction API

This project aims to provide a robust API for predicting wet diabetes based on images and managing user profiles. The API serves as a platform to raise public awareness and facilitate informed decisions regarding wet diabetes management.

## Table of Contents
- [Python API (Wet Diabetes Prediction)](#python-api-wet-diabetes-prediction)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [API Endpoint](#api-endpoint)
- [Node.js API (User Management)](#nodejs-api-user-management)
  - [Requirements](#requirements-1)
  - [Installation](#installation-1)
  - [API Endpoints](#api-endpoints)
- [License](#license)

## Python API (Wet Diabetes Prediction)

### Requirements
- Python 3.x
- FastAPI
- TensorFlow
- Keras
- Google Cloud Firestore
- uvicorn

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/C241-PS090/Cloud-Computing.git
    cd repository-name/predict-api
    ```

2. Set up virtual environment and install dependencies:
    ```sh
    python -m venv env
    source env/bin/activate  # For Windows: .\env\Scripts\activate
    pip install -r requirements.txt
    ```

3. Configure Firestore credentials.

4. Run the application:
    ```sh
    flask run
    ```

### API Endpoint

**POST /predict**
- Predict wet diabetes occurrence from an image.
- Parameters: `img_array` (multipart/form-data)
- After prediction, the result will be stored in Google Cloud Firestore.
- Example Response:
    ```json
    {
        "class": "Abnormal(Ulcer)",
        "confidence": 87.6467657654426
    }
    ```

## Node.js API (User Management)

### Requirements
- Node.js
- Express Js
- Google Cloud Firestore
- Google Cloud Storage
- Multer
- JWT Authentication
- Body-parser

### Installation

1. Navigate to the Node.js API directory:
    ```sh
    cd ../backend-api
    ```

2. Install all requirements:
    ```sh
    npm install [from list requirements above]
    ```

3. Configure Firestore credentials and JWT secret key.

4. Run the application:
    ```sh
    npm start
    ```

### API Endpoints

**POST /api/login**
- Login user.

**POST /api/register**
- Create a new user profile.

**GET /api/users**
- Retrieve all user profile details.

**GET /api/users/:userId**
- Retrieve user profile details by id.

**PUT /api/users/:userId**
- Update a user profile.

**DELETE /api/logout**
- Logout user profile.

**GET /api/users/:userId/prediction**
- Retrieve user profile predictions details by id.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
