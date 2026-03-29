from pathlib import Path

import torch
from PIL import Image
from torchvision import transforms

from app.config import settings
from app.models.deblur_net import UNetResidual, load_deblur_state_dict
from app.utils.metrics import compute_psnr, compute_ssim_simple
from app.utils.sharpness import laplacian_improvement_percent

_model: UNetResidual | None = None
_device: torch.device | None = None


def _get_device() -> torch.device:
    global _device
    if _device is None:
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return _device


def get_deblur_model() -> UNetResidual:
    global _model
    if _model is None:
        path = settings.resolved_deblur_weights()
        if not path.is_file():
            raise FileNotFoundError(f"Deblur weights not found: {path}")
        device = _get_device()
        state = load_deblur_state_dict(path, device)
        net = UNetResidual(base=64).to(device)
        net.load_state_dict(state, strict=True)
        net.eval()
        _model = net
    return _model


def run_deblur(
    image_path: Path,
    output_path: Path,
) -> dict:
    device = _get_device()
    model = get_deblur_model()
    size = settings.inference_size
    original = Image.open(image_path).convert("RGB")
    resized = original.resize((size, size), Image.BICUBIC)
    to_tensor = transforms.ToTensor()
    input_tensor = to_tensor(resized).unsqueeze(0).to(device)
    with torch.no_grad():
        if device.type == "cuda":
            with torch.amp.autocast("cuda"):
                output_tensor = model(input_tensor).clamp(0, 1).float()
        else:
            output_tensor = model(input_tensor).clamp(0, 1).float()
    out_cpu = output_tensor.squeeze(0).cpu()
    output_pil = transforms.ToPILImage()(out_cpu)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_pil.save(output_path)

    psnr = compute_psnr(output_tensor, input_tensor)
    ssim = compute_ssim_simple(output_tensor, input_tensor)
    sharp_pct = laplacian_improvement_percent(resized, output_pil)

    if sharp_pct > 5:
        summary = (
            f"Laplacian sharpness increased by about {sharp_pct:.1f}%. "
            f"PSNR versus input is {psnr:.2f} dB and SSIM is {ssim:.4f}."
        )
    elif sharp_pct < -5:
        summary = (
            f"Laplacian sharpness changed by {sharp_pct:.1f}%. "
            f"PSNR versus input is {psnr:.2f} dB and SSIM is {ssim:.4f}."
        )
    else:
        summary = (
            f"Laplacian sharpness change is about {sharp_pct:.1f}%. "
            f"PSNR versus input is {psnr:.2f} dB and SSIM is {ssim:.4f}."
        )

    return {
        "psnr_vs_input": round(psnr, 4),
        "ssim_vs_input": round(ssim, 6),
        "laplacian_sharpness_change_percent": round(sharp_pct, 4),
        "improvement_summary": summary,
    }
