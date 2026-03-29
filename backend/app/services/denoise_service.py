from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torchvision import transforms

from app.config import settings
from app.models.denoise_net import LightweightResidualDenoiser, load_denoise_state_dict
from app.utils.metrics import compute_psnr, compute_ssim_simple

_model: LightweightResidualDenoiser | None = None
_device: torch.device | None = None


def _get_device() -> torch.device:
    global _device
    if _device is None:
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return _device


def get_denoise_model() -> LightweightResidualDenoiser:
    global _model
    if _model is None:
        path = settings.resolved_denoise_weights()
        if not path.is_file():
            raise FileNotFoundError(f"Denoise weights not found: {path}")
        device = _get_device()
        state = load_denoise_state_dict(path, device)
        net = LightweightResidualDenoiser(in_channels=3, features=48, num_blocks=8).to(device)
        net.load_state_dict(state, strict=True)
        net.eval()
        _model = net
    return _model


def _pil_to_model_input(pil_img: Image.Image) -> torch.Tensor:
    arr = np.array(pil_img.convert("RGB")).astype(np.float32) / 255.0
    t = torch.from_numpy(arr.transpose(2, 0, 1)).float()
    return t.unsqueeze(0)


def run_denoise(
    image_path: Path,
    output_path: Path,
) -> dict:
    device = _get_device()
    model = get_denoise_model()
    size = settings.inference_size
    pil_in = Image.open(image_path).convert("RGB")
    resized = pil_in.resize((size, size), Image.BICUBIC)
    input_tensor = _pil_to_model_input(resized).to(device)
    with torch.no_grad():
        if device.type == "cuda":
            with torch.amp.autocast("cuda"):
                output_tensor = model(input_tensor).float()
        else:
            output_tensor = model(input_tensor).float()

    out_cpu = output_tensor.squeeze(0).cpu().clamp(0, 1)
    output_pil = transforms.ToPILImage()(out_cpu)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_pil.save(output_path)

    psnr = compute_psnr(output_tensor, input_tensor)
    ssim = compute_ssim_simple(output_tensor, input_tensor)
    summary = f"PSNR versus input is {psnr:.2f} dB and SSIM is {ssim:.4f}."

    return {
        "psnr_vs_input": round(psnr, 4),
        "ssim_vs_input": round(ssim, 6),
        "improvement_summary": summary,
    }
