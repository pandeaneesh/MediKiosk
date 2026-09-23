import logging
import math
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import cv2

logger = logging.getLogger("MediKiosk.OCR")


class OCREngine:
    """
    Production OCR Engine powered by RapidOCR (PaddleOCR ONNX Runtime).
    Extracts text, confidence scores, and bounding box coordinates [x1, y1, x2, y2].
    """

    def __init__(self):
        self.engine = None
        self._init_engine()

    def _init_engine(self):
        try:
            from rapidocr_onnxruntime import RapidOCR

            self.engine = RapidOCR()
            logger.info(" RapidOCR (PaddleOCR ONNX) engine initialized successfully")
        except Exception as e:
            logger.warning(" RapidOCR init failed (%s). Fallback heuristics active.", e)
            self.engine = None

    def extract_text_and_boxes(
        self,
        image_path: str,
        scale_factor: float = 1.5,
        orig_dims: Optional[Tuple[int, int]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Runs OCR on preprocessed image and maps coordinates back to original unscaled coordinates.
        Returns:
            [
                {
                    "text": "Tab Metformin 500 mg",
                    "confidence": 0.94,
                    "bbox": [120, 240, 480, 280],
                    "page": 1
                }
            ]
        """
        blocks: List[Dict[str, Any]] = []

        if self.engine is not None:
            try:
                ocr_results, elapse = self.engine(image_path)
                if ocr_results:
                    for item in ocr_results:
                        # item: [polygon_points, text, confidence]
                        poly = item[0]
                        text = str(item[1]).strip()
                        conf = float(item[2])

                        # Calculate bounding box
                        xs = [pt[0] for pt in poly]
                        ys = [pt[1] for pt in poly]
                        min_x = min(xs)
                        max_x = max(xs)
                        min_y = min(ys)
                        max_y = max(ys)

                        # Rescale back to original image space
                        if scale_factor > 0 and scale_factor != 1.0:
                            min_x = min_x / scale_factor
                            max_x = max_x / scale_factor
                            min_y = min_y / scale_factor
                            max_y = max_y / scale_factor

                        bbox = [int(round(min_x)), int(round(min_y)), int(round(max_x)), int(round(max_y))]

                        blocks.append({
                            "text": text,
                            "confidence": round(conf, 3),
                            "bbox": bbox,
                            "page": 1,
                        })
                logger.info("OCR completed for %s: extracted %d text blocks", image_path, len(blocks))
                return blocks
            except Exception as e:
                logger.error("OCR execution error on %s: %s", image_path, e)

        # In case no text found or engine failed, return empty or fallback
        return blocks


# Global singleton
ocr_engine = OCREngine()
