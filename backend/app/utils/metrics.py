import math

import torch
import torch.nn.functional as F


def compute_psnr(pred: torch.Tensor, target: torch.Tensor, max_val: float = 1.0) -> float:
    mse = F.mse_loss(pred, target).item()
    if mse == 0:
        return 100.0
    return 20 * math.log10(max_val / math.sqrt(mse))


def compute_ssim_simple(pred: torch.Tensor, target: torch.Tensor) -> float:
    c1 = 0.01**2
    c2 = 0.03**2
    mu_x = pred.mean(dim=[2, 3], keepdim=True)
    mu_y = target.mean(dim=[2, 3], keepdim=True)
    sigma_x = ((pred - mu_x) ** 2).mean(dim=[2, 3], keepdim=True)
    sigma_y = ((target - mu_y) ** 2).mean(dim=[2, 3], keepdim=True)
    sigma_xy = ((pred - mu_x) * (target - mu_y)).mean(dim=[2, 3], keepdim=True)
    ssim_map = ((2 * mu_x * mu_y + c1) * (2 * sigma_xy + c2)) / (
        (mu_x**2 + mu_y**2 + c1) * (sigma_x + sigma_y + c2)
    )
    return ssim_map.mean().item()
