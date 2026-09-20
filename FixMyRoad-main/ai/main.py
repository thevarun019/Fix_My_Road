from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
from privacy import blur_privacy_regions
from detector import detect_road_damage

app = FastAPI(
    title="RoadWatch AI Microservice",
    description="Privacy protection (face/plate blur) and road damage analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "roadwatch-ai", "version": "1.0.0"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image:
    1. Detects road damage type (Pothole, Crack, Waterlogging) and severity
    2. Runs privacy blur detection
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image payload")
        
    damage_analysis = detect_road_damage(contents)
    _, privacy_meta = blur_privacy_regions(contents)
    
    return {
        "status": "success",
        "damage": damage_analysis,
        "privacy": privacy_meta
    }

@app.post("/blur-privacy")
async def blur_image(file: UploadFile = File(...)):
    """
    Returns the blurred image as JPEG stream ensuring citizen privacy.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image payload")
        
    blurred_bytes, meta = blur_privacy_regions(contents)
    return Response(content=blurred_bytes, media_type="image/jpeg", headers={
        "X-Faces-Blurred": str(meta.get("faces_blurred", 0)),
        "X-Plates-Blurred": str(meta.get("plates_blurred", 0))
    })

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
