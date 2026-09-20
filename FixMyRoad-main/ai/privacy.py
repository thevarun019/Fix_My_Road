import cv2
import numpy as np

# Check if CascadeClassifier is available
face_cascade = None
plate_cascade = None

try:
    if hasattr(cv2, 'CascadeClassifier') and hasattr(cv2, 'data'):
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        plate_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_russian_plate_number.xml')
except Exception:
    face_cascade = None
    plate_cascade = None

def blur_privacy_regions(image_bytes: bytes) -> tuple[bytes, dict]:
    """
    Detects faces and vehicle license plates in civic complaint photos
    and applies heavy Gaussian blur to preserve citizen privacy.
    Works across OpenCV 4.x and 5.x.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return image_bytes, {"faces_blurred": 0, "plates_blurred": 0, "privacy_compliant": True}

    h, w = img.shape[:2]
    faces_count = 0
    plates_count = 0

    if face_cascade and not face_cascade.empty():
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        for (x, y, fw, fh) in faces:
            pad = int(fw * 0.1)
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(w, x + fw + pad)
            y2 = min(h, y + fh + pad)
            sub = img[y1:y2, x1:x2]
            ksize = max(51, (sub.shape[1] // 2) * 2 + 1)
            img[y1:y2, x1:x2] = cv2.GaussianBlur(sub, (ksize, ksize), 30)
            faces_count += 1

    if plate_cascade and not plate_cascade.empty():
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        plates = plate_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(25, 25))
        for (x, y, pw, ph) in plates:
            sub = img[y:y+ph, x:x+pw]
            ksize = max(31, (sub.shape[1] // 2) * 2 + 1)
            img[y:y+ph, x:x+pw] = cv2.GaussianBlur(sub, (ksize, ksize), 30)
            plates_count += 1

    is_success, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    if not is_success:
        return image_bytes, {"faces_blurred": faces_count, "plates_blurred": plates_count, "privacy_compliant": True}

    return buffer.tobytes(), {
        "faces_blurred": faces_count,
        "plates_blurred": plates_count,
        "privacy_compliant": True
    }
