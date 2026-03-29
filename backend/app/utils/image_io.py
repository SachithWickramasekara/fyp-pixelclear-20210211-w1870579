import uuid
from pathlib import Path

from PIL import Image, UnidentifiedImageError

from app.config import settings


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


def new_stem(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex}"
