from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
from io import BytesIO
from google.cloud import firestore
import os
import uvicorn
from datetime import datetime

app = FastAPI()

class_names = ['Abnormal(Ulcer)', 'Normal(Healthy skin)', 'Wound Images']

# Muat model
model = tf.keras.models.load_model('model_fix.h5')

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/secrets/serviceAccountKey.json"

def predict_image(img_array):
    predictions = model.predict(img_array)
    print(f"Raw predictions: {predictions}")
    score = tf.nn.softmax(predictions[0])
    print(f"Softmax score: {score}")
    return {
        "class": class_names[np.argmax(score)],
        "confidence": float(100 * np.max(score))
    }

def store_data_in_firestore(data):
    db = firestore.Client()
    db.collection('predictions').add(data)

@app.post("/predict")
async def predict(file: UploadFile = File(...), userId: str = Form(...)):
    try:
        # Muat gambar
        img = image.load_img(BytesIO(await file.read()), target_size=(224, 224))

        # Praproses gambar
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)

        # Prediksi gambar
        predictions = predict_image(img_array)

        # Tambahkan userId dan created_at ke dalam prediksi
        created_at = datetime.now().isoformat()
        predictions['userId'] = userId
        predictions['created_at'] = created_at

        # Simpan hasil prediksi ke Firestore
        store_data_in_firestore(predictions)

        return JSONResponse(content={"predictions": predictions}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    uvicorn.run(app, debug=True, host='0.0.0.0', port=8080)
