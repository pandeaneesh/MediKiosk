import logging
import os
from pathlib import Path
from typing import Tuple

import cv2
import numpy as np

logger = logging.getLogger("MediKiosk.Preprocess")


def deskew_image(image: np.ndarray) -> np.ndarray:
    """Detects text orientation and deskews document image for superior OCR accuracy."""
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) < 100:
            return image
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        elif angle > 45:
            angle = 90 - angle
        else:
            angle = -angle

        if abs(angle) < 0.5 or abs(angle) > 45:
            return image

        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        m = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            image, m, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
        )
        return rotated
    except Exception as e:
        logger.debug("Deskew failed or skipped: %s", e)
        return image


def enhance_handwriting_contrast(image: np.ndarray) -> np.ndarray:
    """
    State-of-the-art clinical enhancement for doctor handwriting:
    - Bilateral filtering to smooth paper background while preserving thin ink edges
    - CLAHE (Contrast Limited Adaptive Histogram Equalization) to bring out faint ballpoint pen ink
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    # Bilateral filter removes paper texture without blurring pen stroke edges
    filtered = cv2.bilateralFilter(gray, d=7, sigmaColor=50, sigmaSpace=50)

    # CLAHE dynamically balances shadows and highlights across the prescription
    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
    enhanced = clahe.apply(filtered)

    # Slight unsharp mask to crisply define doctor handwriting strokes
    gaussian = cv2.GaussianBlur(enhanced, (0, 0), 2.0)
    unsharp = cv2.addWeighted(enhanced, 1.35, gaussian, -0.35, 0)
    return unsharp


def preprocess_image(input_path: str, output_path: str) -> Tuple[str, Tuple[int, int]]:
    """
    Preprocesses medical document image without destroying handwriting ink:
    1. Reads original image
    2. Measures original dimensions
    3. Corrects skew if tilted
    4. Upscales low-res mobile photos (Lanczos / Cubic) so small cursive letters are distinguishable
    5. Applies adaptive contrast enhancement (CLAHE + Bilateral filtering)
    6. Saves preprocessed image
    """
    image = cv2.imread(str(input_path))
    if image is None:
        raise ValueError(f"Unable to read image at: {input_path}")

    orig_h, orig_w = image.shape[:2]

    # Deskew if needed
    deskewed = deskew_image(image)

    # Determine optimal scaling: if image is small (e.g. WhatsApp photo < 800px width), upscale 2.2x
    scale_factor = 2.2 if orig_w < 800 else 1.4
    scaled = cv2.resize(
        deskewed,
        None,
        fx=scale_factor,
        fy=scale_factor,
        interpolation=cv2.INTER_LANCZOS4 if scale_factor > 1.5 else cv2.INTER_CUBIC,
    )

    # Enhance handwriting ink visibility without harsh threshold clipping
    enhanced = enhance_handwriting_contrast(scaled)

    # Save to disk
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), enhanced)

    logger.info(
        "Preprocessed handwriting image saved to %s (Orig: %dx%d, Scaled: %dx%d, Factor: %.1fx)",
        output_path,
        orig_w,
        orig_h,
        scaled.shape[1],
        scaled.shape[0],
        scale_factor,
    )
    return output_path, (orig_w, orig_h)
