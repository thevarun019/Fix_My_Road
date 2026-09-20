import cv2
import numpy as np

def _is_road_surface(img: np.ndarray) -> tuple[bool, str]:
    """
    Validates that the image actually shows a road/ground surface.
    Returns (is_valid, rejection_reason).
    
    Rejection heuristics:
    - Screenshots / UI: very high blue-dominant regions, extreme uniformity, or
      presence of sharp rectangular text-like structures taking up most of the frame.
    - Non-outdoor images: dominant bright-white or very-low-variance images.
    - Too many perfectly straight long horizontal/vertical lines (screen UI).
    """
    h, w = img.shape[:2]
    total_pixels = h * w

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # --- 1. Uniformity check: extremely low std deviation = blank/solid color image ---
    std_dev = float(np.std(gray))
    if std_dev < 8.0:
        return False, "Image appears blank or has nearly uniform color. Please upload a clear photo of the road damage."

    # --- 2. Screenshot / UI detection via Hough line dominance ---
    # Screenshots have many perfect straight horizontal & vertical lines
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80,
                             minLineLength=w * 0.35, maxLineGap=10)
    h_lines = 0
    v_lines = 0
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
            if angle < 10 or angle > 170:
                h_lines += 1
            elif 80 < angle < 100:
                v_lines += 1

    # More than 6 strong horizontal AND 4 vertical lines → very likely a UI screenshot
    if h_lines > 6 and v_lines > 4:
        return False, (
            "The uploaded image appears to be a screenshot or UI capture, not a real road photo. "
            "Please take or upload an actual photo of the road damage (pothole, crack, or waterlogging)."
        )

    # --- 3. Color distribution check ---
    b, g, r = cv2.split(img)
    mean_b = float(np.mean(b))
    mean_g = float(np.mean(g))
    mean_r = float(np.mean(r))
    mean_brightness = (mean_b + mean_g + mean_r) / 3.0

    # Very bright white images (documents, white backgrounds)
    if mean_brightness > 220 and std_dev < 25:
        return False, "Image is too bright/white. Please upload a photo taken outdoors of an actual road surface."

    # Blue-dominant + high brightness = likely a UI with blue nav bars (screenshots)
    if mean_b > mean_r * 1.4 and mean_b > mean_g * 1.25 and mean_brightness > 160:
        return False, (
            "The image color profile does not match a road surface. "
            "It may be a screenshot or an indoor/irrelevant photo. Please upload a real road photo."
        )

    # --- 4. Texture check: road surfaces have moderate, irregular texture ---
    # A laplacian variance below threshold = too smooth (glass/screen/paper)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if laplacian_var < 30:
        return False, (
            "Image lacks the texture expected in a road surface photo. "
            "Please take a clear photo of the road hazard (pothole, crack, waterlogging)."
        )

    # --- 5. Dominant gray/asphalt tones check ---
    # Road surfaces are predominantly gray, dark-gray, brown, or dark-tan
    # Convert to HSV and check saturation: roads have LOW saturation
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    saturation = hsv[:, :, 1]
    mean_saturation = float(np.mean(saturation))

    # Very high saturation over large area = colorful non-road image
    high_sat_ratio = np.sum(saturation > 100) / total_pixels
    if high_sat_ratio > 0.55 and mean_saturation > 90:
        return False, (
            "The image appears to contain highly colorful, non-road content. "
            "Road surfaces typically appear in gray, brown, or dark tones. "
            "Please upload a photo of the actual road defect."
        )

    return True, ""


def detect_road_damage(image_bytes: bytes) -> dict:
    """
    Analyzes road surface image for potholes, cracks, and waterlogging.
    First validates that the image is actually a road surface image.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {
            "detected": False,
            "isRoadHazard": False,
            "rejectionReason": "Could not decode image. Please upload a valid JPEG or PNG photo.",
            "category": "UNKNOWN",
            "confidence": 0.0,
            "severity": "LOW",
            "boxes": []
        }

    h, w = img.shape[:2]

    # --- Step 1: Validate it's a road image ---
    is_road, rejection_reason = _is_road_surface(img)
    if not is_road:
        return {
            "detected": False,
            "isRoadHazard": False,
            "rejectionReason": rejection_reason,
            "category": "NOT_ROAD",
            "confidence": 0.0,
            "severity": "LOW",
            "boxes": []
        }

    # --- Step 2: Actual damage detection ---
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
        if area > 400:
            x, y, bw, bh = cv2.boundingRect(cnt)
            aspect_ratio = float(bw) / bh if bh > 0 else 1
            hull = cv2.convexHull(cnt)
            hull_area = cv2.contourArea(hull)
            solidity = float(area) / hull_area if hull_area > 0 else 0

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

    # Waterlogging check
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
        "isRoadHazard": True,
        "rejectionReason": None,
        "category": category,
        "confidence": confidence,
        "severity": severity,
        "relative_damage_percentage": round(relative_damage * 100, 2),
        "boxes_count": len(boxes),
        "top_boxes": boxes[:5]
    }
