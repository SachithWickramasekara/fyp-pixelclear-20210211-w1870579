from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routes.restore_routes import router as restore_router

app = FastAPI(title="PixelClear Restoration API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_root = settings.resolved_static_dir()
static_root.mkdir(parents=True, exist_ok=True)
(static_root / "uploads").mkdir(parents=True, exist_ok=True)
(static_root / "outputs").mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_root)), name="static")

app.include_router(restore_router)


@app.exception_handler(RequestValidationError)
async def request_validation_handler(_request, exc: RequestValidationError):
    errs = exc.errors()
    msg = "Invalid request"
    for e in errs:
        if e.get("type") == "missing":
            msg = "Missing image file; use multipart form field name: image"
            break
    return JSONResponse(
        status_code=400,
        content={"success": False, "message": msg},
    )


@app.get("/health")
async def health():
    return {"ok": True}
