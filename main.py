from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import io
import tempfile
import os
from gradio_client import Client, handle_file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gradio client for Hugging Face Space
gradio_client = Client("raj00019/Multimodal-AI-Agent-for-Healthcare-Diagnosis")

# Mock models for demo (fallback)
CLASS_LABELS = {
    "skin": ["normal", "eczema", "psoriasis"],
    "retina": ["normal", "retinopathy_mild", "retinopathy_severe"]
}

@app.post("/transcribe-soap")
async def transcribe_to_soap(audio: UploadFile = File(...)):
    if audio is None or not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided")

    # Save audio to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_audio:
        tmp_audio.write(await audio.read())
        audio_path = tmp_audio.name

    try:
        # Call Gradio multimodal AI with audio only, dummy patient data
        result = gradio_client.predict(
            audio_filepath=handle_file(audio_path),
            image_filepath=None,
            patient_id="P001",
            patient_name="Unknown",
            age="30",
            sex="Unknown",
            date_of_birth="1990-01-01",
            phone_no="0000000000",
            address="Unknown",
            api_name="/submit_callback"
        )

        # Parse result: [speech_to_text, doctor_response, treatment_plan, medicines, safety_notes, confidence, triage, chat_history, audio_response]
        speech_to_text = result[0]
        doctor_response = result[1]
        treatment_plan = result[2]
        medicines = result[3]
        safety_notes = result[4]
        confidence = result[5]
        triage = result[6]

        # Generate SOAP from AI response
        soap_json = {
            "subjective": speech_to_text,
            "objective": f"AI Confidence: {confidence}",
            "assessment": doctor_response,
            "plan": f"{treatment_plan}. Medicines: {medicines}. Safety: {safety_notes}. Triage: {triage}"
        }

        return {"transcript": speech_to_text, "soap": soap_json}
    except Exception as e:
        # Fallback to mock
        transcript = "Patient reports headache, fever for 3 days, SpO2 89%"
        soap_json = {
            "subjective": "Patient reports headache and fever for 3 days. SpO2 is 89%.",
            "objective": "Vital signs: SpO2 89%, Heart rate 95 bpm, Temperature 101.5°F",
            "assessment": "Suspected respiratory infection with hypoxia",
            "plan": "Administer oxygen, refer to higher center, monitor vitals"
        }
        return {"transcript": transcript, "soap": soap_json}
    finally:
        os.unlink(audio_path)

@app.post("/full_diagnose")
async def full_diagnose(
    audio: UploadFile = File(None),
    image: UploadFile = File(None),
    patient_id: str = Form(...),
    patient_name: str = Form(...),
    age: str = Form(...),
    sex: str = Form(...),
    date_of_birth: str = Form(...),
    phone_no: str = Form(...),
    address: str = Form(...)
):
    audio_path = None
    image_path = None

    if audio and audio.filename:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_audio:
            tmp_audio.write(await audio.read())
            audio_path = tmp_audio.name

    if image and image.filename:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_img:
            tmp_img.write(await image.read())
            image_path = tmp_img.name

    try:
        # Call Gradio multimodal AI
        result = gradio_client.predict(
            audio_filepath=handle_file(audio_path) if audio_path else None,
            image_filepath=handle_file(image_path) if image_path else None,
            patient_id=patient_id,
            patient_name=patient_name,
            age=age,
            sex=sex,
            date_of_birth=date_of_birth,
            phone_no=phone_no,
            address=address,
            api_name="/submit_callback"
        )

        # Parse result
        speech_to_text = result[0]
        doctor_response = result[1]
        treatment_plan = result[2]
        medicines = result[3]
        safety_notes = result[4]
        confidence = result[5]
        triage = result[6]
        chat_history = result[7]
        audio_response = result[8]

        return {
            "speech_to_text": speech_to_text,
            "doctor_response": doctor_response,
            "treatment_plan": treatment_plan,
            "medicines": medicines,
            "safety_notes": safety_notes,
            "confidence": confidence,
            "triage": triage,
            "chat_history": chat_history,
            "audio_response": audio_response
        }
    except Exception as e:
        # Fallback
        return {
            "speech_to_text": "Mock transcript",
            "doctor_response": "Mock diagnosis",
            "treatment_plan": "Mock plan",
            "medicines": "Mock medicines",
            "safety_notes": "Mock notes",
            "confidence": 0.8,
            "triage": "Low",
            "chat_history": [],
            "audio_response": None
        }
    finally:
        if audio_path:
            os.unlink(audio_path)
        if image_path:
            os.unlink(image_path)