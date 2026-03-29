from pathlib import Path

import torch
import torch.nn as nn


class ImprovedResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False)
        self.norm1 = nn.BatchNorm2d(channels, track_running_stats=False)
        self.act = nn.LeakyReLU(0.2, inplace=True)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False)
        self.norm2 = nn.BatchNorm2d(channels, track_running_stats=False)

    def forward(self, x):
        out = self.act(self.norm1(self.conv1(x)))
        out = self.norm2(self.conv2(out))
        return out + x


class SEBlock(nn.Module):
    def __init__(self, channels, reduction=8):
        super().__init__()
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(channels, max(channels // reduction, 4)),
            nn.ReLU(inplace=True),
            nn.Linear(max(channels // reduction, 4), channels),
            nn.Sigmoid(),
        )

    def forward(self, x):
        w = self.pool(x).flatten(1)
        w = self.fc(w).view(-1, x.size(1), 1, 1)
        return x * w


class LightweightResidualDenoiser(nn.Module):
    def __init__(self, in_channels=3, features=48, num_blocks=8):
        super().__init__()

        self.entry = nn.Sequential(
            nn.Conv2d(in_channels, features, kernel_size=3, padding=1, bias=True),
            nn.LeakyReLU(0.2, inplace=True),
        )

        self.res_blocks = nn.Sequential(
            *[ImprovedResidualBlock(features) for _ in range(num_blocks)]
        )

        self.attention = SEBlock(features, reduction=8)

        self.feature_fusion = nn.Conv2d(
            features, features, kernel_size=3, padding=1, bias=True
        )

        self.exit = nn.Conv2d(features, in_channels, kernel_size=3, padding=1, bias=True)

        nn.init.zeros_(self.exit.weight)
        nn.init.zeros_(self.exit.bias)

    def forward(self, x):
        feat = self.entry(x)
        feat = self.res_blocks(feat)
        feat = self.attention(feat)
        feat = self.feature_fusion(feat)
        predicted_noise = self.exit(feat)

        return torch.clamp(x - predicted_noise, 0.0, 1.0)


def load_denoise_state_dict(path: str | Path, device: torch.device) -> dict:
    try:
        ckpt = torch.load(path, map_location=device, weights_only=False)
    except TypeError:
        ckpt = torch.load(path, map_location=device)
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        return ckpt["model_state_dict"]
    if isinstance(ckpt, dict):
        return ckpt
    raise ValueError("Invalid checkpoint format")
