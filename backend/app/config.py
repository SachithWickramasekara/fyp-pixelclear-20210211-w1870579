from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _backend_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _first_existing(candidates: list[Path]) -> Path:
    for path in candidates:
        if path.is_file():
            return path
    return candidates[0]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="PIXELCLEAR_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    repo_root: Path = _default_repo_root()
    public_base_url: str = "http://localhost:5000"
    deblur_weights_path: Path | None = None
    denoise_weights_path: Path | None = None
    static_dir: Path | None = None
    inference_size: int = 512
    allowed_image_content_types: frozenset[str] = frozenset(
        {"image/jpeg", "image/png", "image/webp", "image/pjpeg"}
    )

    def resolved_deblur_weights(self) -> Path:
        if self.deblur_weights_path is not None:
            return Path(self.deblur_weights_path)
        return _first_existing(
            [
                _backend_root() / "model" / "unet_residual_v7_best.pth",
                self.repo_root / "model" / "deblurring" / "unet_residual_v7_best.pth",
            ]
        )

    def resolved_denoise_weights(self) -> Path:
        if self.denoise_weights_path is not None:
            return Path(self.denoise_weights_path)
        return _first_existing(
            [
                _backend_root() / "model" / "proposed_denoiser_best.pth",
                self.repo_root / "model" / "denoising" / "proposed_denoiser_best.pth",
            ]
        )

    def resolved_static_dir(self) -> Path:
        if self.static_dir is not None:
            return Path(self.static_dir)
        return Path(__file__).resolve().parents[1] / "static"


settings = Settings()
