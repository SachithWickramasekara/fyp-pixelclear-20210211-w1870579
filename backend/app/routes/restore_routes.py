from pathlib import Path

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse

from app.config import settings
from app.services.deblur_service import run_deblur
from app.services.denoise_service import run_denoise
from app.utils.image_io import ensure_dirs, new_stem, open_rgb_pil, validate_upload

router = APIRouter(prefix="/api/restore", tags=["restore"])


def _public_url(rel_static: str) -> str:
    base = settings.public_base_url.rstrip("/")
    return f"{base}{rel_static}"


async def _save_upload(image: UploadFile, dest: Path) -> None:
    validate_upload(image.content_type, image.filename)
    try:
        body = await image.read()
        if not body:
            raise ValueError("Empty file")
        dest.write_bytes(body)
        open_rgb_pil(dest)
    except ValueError:
        if dest.is_file():
            dest.unlink(missing_ok=True)
        raise
    except Exception:
        if dest.is_file():
            dest.unlink(missing_ok=True)
        raise ValueError("Invalid or corrupted image") from None


@router.post("/deblur")
async def restore_deblur(image: UploadFile = File(...)):
    uploads_dir, outputs_dir = ensure_dirs()
    stem = new_stem("up")
    suffix = Path(image.filename or "upload").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ""}:
        suffix = ".png"
    upload_path = uploads_dir / f"{stem}{suffix}"
    try:
        await _save_upload(image, upload_path)
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)},
        )
    out_name = f"{stem}_deblurred.png"
    output_path = outputs_dir / out_name
    try:
        metrics = run_deblur(upload_path, output_path)
    except FileNotFoundError as e:
        return JSONResponse(
            status_code=503,
            content={"success": False, "message": str(e)},
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Model load or inference failed: {e}"},
        )
    rel = f"/static/outputs/{out_name}"
    return {
        "success": True,
        "message": "Deblurring finished.",
        "outputUrl": _public_url(rel),
        "metrics": metrics,
    }


@router.post("/denoise")
async def restore_denoise(image: UploadFile = File(...)):
    uploads_dir, outputs_dir = ensure_dirs()
    stem = new_stem("up")
    suffix = Path(image.filename or "upload").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ""}:
        suffix = ".png"
    upload_path = uploads_dir / f"{stem}{suffix}"
    try:
        await _save_upload(image, upload_path)
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)},
        )
    out_name = f"{stem}_denoised.png"
    output_path = outputs_dir / out_name
    try:
        metrics = run_denoise(upload_path, output_path)
    except FileNotFoundError as e:
        return JSONResponse(
            status_code=503,
            content={"success": False, "message": str(e)},
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Model load or inference failed: {e}"},
        )
    rel = f"/static/outputs/{out_name}"
    return {
        "success": True,
        "message": "Denoising finished.",
        "outputUrl": _public_url(rel),
        "metrics": metrics,
    }
