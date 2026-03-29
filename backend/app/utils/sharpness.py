import cv2
import numpy as np
from PIL import Image


def variance_of_laplacian(pil_img: Image.Image) -> float:
    img = np.array(pil_img.convert("RGB"))
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def laplacian_improvement_percent(input_pil: Image.Image, output_pil: Image.Image) -> float:
    input_score = variance_of_laplacian(input_pil)
    output_score = variance_of_laplacian(output_pil)
    if input_score < 1e-8:
        return 0.0
    return ((output_score - input_score) / input_score) * 100.0
