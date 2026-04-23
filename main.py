from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock models for demo
CLASS_LABELS = {
    "skin": ["normal", "eczema", "psoriasis"],
    "retina": ["normal", "retinopathy_mild", "retinopathy_severe"]
}

@app.post("/transcribe-soap")
async def transcribe_to_soap(audio: UploadFile = File(...)):
    if audio is None or not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided")

    # Mock transcription and SOAP generation
    transcript = "Patient reports headache, fever for 3 days, SpO2 89%"

    soap_json = {
        "subjective": "Patient reports headache and fever for 3 days. SpO2 is 89%.",
        "objective": "Vital signs: SpO2 89%, Heart rate 95 bpm, Temperature 101.5°F",
        "assessment": "Suspected respiratory infection with hypoxia",
        "plan": "Administer oxygen, refer to higher center, monitor vitals"
    }

    return {"transcript": transcript, "soap": soap_json}

@app.post("/diagnose/image")
async def diagnose_image(image: UploadFile = File(...), model_type: str = Form(...)):
    # Mock diagnostic
    top_class = CLASS_LABELS[model_type][1] if model_type in CLASS_LABELS else "normal"
    confidence = 0.87

    return {
        "prediction": top_class,
        "confidence": confidence,
        "requires_referral": confidence > 0.75 and top_class != "normal"
    }