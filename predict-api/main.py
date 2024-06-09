from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
from io import BytesIO
from google.cloud import storage, firestore
import os

app = FastAPI()

class_names = ['Abnormal(Ulcer)', 'Normal(Healthy skin)', 'Wound Images']

# Muat model
model = tf.keras.models.load_model('/home/tartar/predict-api/model/model_fix.h5')

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./config/serviceAccount.json"

def predict_image(img_array):
    predictions = model.predict(img_array)
    score = tf.nn.softmax(predictions[0])
    return {
        "class": class_names[np.argmax(score)],
        "confidence": float(100 * np.max(score))
    }

def store_data_in_firestore(data):
    db = firestore.Client()
    db.collection('predictions').add(data)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Muat gambar
        img = image.load_img(BytesIO(await file.read()), target_size=(224, 224))

        # Praproses gambar
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)

        # Prediksi gambar
        predictions = predict_image(img_array)

        # Simpan hasil prediksi ke Firestore
        store_data_in_firestore(predictions)

        return JSONResponse(content={"predictions": predictions}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    uvicorn.run(app, debug=True, host='0.0.0.0', port=14045)
