import uuid
from pathlib import Path

import numpy as np
from PIL import Image, UnidentifiedImageError

from app.config import settings

_CONTENT_SAMPLE_MAX_SIDE = 512
_TOO_DARK_MEAN = 8.0
_TOO_DARK_STD = 8.0
_OVEREXPOSED_MEAN = 247.0
_OVEREXPOSED_STD = 8.0
_LOW_CONTRAST_STD = 12.0


def ensure_dirs() -> tuple[Path, Path]:
    base = settings.resolved_static_dir()
    uploads = base / "uploads"
    outputs = base / "outputs"
    uploads.mkdir(parents=True, exist_ok=True)
    outputs.mkdir(parents=True, exist_ok=True)
    return uploads, outputs


def validate_upload(content_type: str | None, filename: str | None) -> None:
    if not content_type:
        raise ValueError("Missing file content type")
    ct = content_type.split(";")[0].strip().lower()
    if ct not in settings.allowed_image_content_types:
        ext = (Path(filename or "").suffix or "").lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
            raise ValueError("Invalid image type")


def open_rgb_pil(path: Path) -> Image.Image:
    try:
        return Image.open(path).convert("RGB")
    except UnidentifiedImageError as e:
        raise ValueError("Invalid or corrupted image") from e


def validate_content_for_restoration(pil_rgb: Image.Image) -> None:
    """Reject uniform, extremely dark, or overexposed images before model inference."""
    w, h = pil_rgb.size
    sample = pil_rgb
    if w > _CONTENT_SAMPLE_MAX_SIDE or h > _CONTENT_SAMPLE_MAX_SIDE:
        sample = pil_rgb.copy()
        sample.thumbnail(
            (_CONTENT_SAMPLE_MAX_SIDE, _CONTENT_SAMPLE_MAX_SIDE),
            Image.Resampling.BILINEAR,
        )

    gray = np.asarray(sample.convert("L"), dtype=np.float64)
    mean_brightness = float(gray.mean())
    std_dev = float(gray.std())

    if mean_brightness < _TOO_DARK_MEAN and std_dev < _TOO_DARK_STD:
        raise ValueError(
            "Image is too dark with no detectable features. "
            "Please upload a photo with visible subject and lighting."
        )
    if mean_brightness > _OVEREXPOSED_MEAN and std_dev < _OVEREXPOSED_STD:
        raise ValueError(
            "Image appears overexposed with almost no detail. "
            "Please upload a photo with normal exposure."
        )
    if std_dev < _LOW_CONTRAST_STD:
        raise ValueError(
            "Image has very little contrast (e.g. a flat color). "
            "Restoration works best on photos with real content."
        )


def new_stem(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex}"
