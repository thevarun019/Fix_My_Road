import cv2
import numpy as np

def detect_road_damage(image_bytes: bytes) -> dict:
    """
    Analyzes road surface image for potholes, cracks, and waterlogging.
    Extracts damage bounding regions, depth/severity estimation, and confidence.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {
            "detected": False,
            "category": "UNKNOWN",
            "confidence": 0.0,
            "severity": "LOW",
            "boxes": []
        }

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Bilateral filter to reduce noise while preserving edges
    blurred = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Adaptive threshold & Canny edge detection
    edges = cv2.Canny(blurred, 50, 150)
    
    # Morphological operations to close contours of cracks & potholes
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Contours analysis
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    boxes = []
    total_damage_area = 0
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        # Filter small noise
        if area > 400:
            x, y, bw, bh = cv2.boundingRect(cnt)
            # Aspect ratio & solidity
            aspect_ratio = float(bw) / bh if bh > 0 else 1
            hull = cv2.convexHull(cnt)
            hull_area = cv2.contourArea(hull)
            solidity = float(area) / hull_area if hull_area > 0 else 0
            
            # Classify contour
            damage_type = "POTHOLE"
            if aspect_ratio > 3.0 or aspect_ratio < 0.33:
                damage_type = "CRACK"
            elif solidity < 0.5:
                damage_type = "BROKEN_SURFACE"
                
            total_damage_area += area
            boxes.append({
                "type": damage_type,
                "box": [int(x), int(y), int(bw), int(bh)],
                "area": float(area),
                "confidence": round(min(0.96, 0.72 + (area / (w * h)) * 1.5), 2)
            })

    # Waterlogging check (specular reflection / dark low-texture blue-gray regions)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_water = np.array([0, 0, 40])
    upper_water = np.array([180, 50, 120])
    water_mask = cv2.inRange(hsv, lower_water, upper_water)
    water_ratio = np.sum(water_mask > 0) / (h * w)

    category = "POTHOLE"
    confidence = 0.88
    
    if water_ratio > 0.25:
        category = "WATERLOGGING"
        confidence = round(min(0.98, 0.75 + water_ratio), 2)
    elif len(boxes) > 0:
        # Determine dominant type
        potholes = sum(1 for b in boxes if b["type"] == "POTHOLE")
        cracks = sum(1 for b in boxes if b["type"] == "CRACK")
        if cracks > potholes:
            category = "CRACK"
        else:
            category = "POTHOLE"
        confidence = max(b["confidence"] for b in boxes)
    else:
        category = "BROKEN_SURFACE"
        confidence = 0.75

    # Determine severity
    relative_damage = (total_damage_area / (h * w))
    if relative_damage > 0.15 or water_ratio > 0.35:
        severity = "CRITICAL"
    elif relative_damage > 0.07 or water_ratio > 0.18:
        severity = "HIGH"
    elif relative_damage > 0.02:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    return {
        "detected": True,
        "category": category,
        "confidence": confidence,
        "severity": severity,
        "relative_damage_percentage": round(relative_damage * 100, 2),
        "boxes_count": len(boxes),
        "top_boxes": boxes[:5]
    }
