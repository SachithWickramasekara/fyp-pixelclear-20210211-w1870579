from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F


class ResConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1, bias=False)
        self.norm1 = nn.InstanceNorm2d(out_ch, affine=True)
        self.relu1 = nn.ReLU(inplace=True)

        self.conv2 = nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1, bias=False)
        self.norm2 = nn.InstanceNorm2d(out_ch, affine=True)
        self.relu2 = nn.ReLU(inplace=True)

        self.skip = (
            nn.Conv2d(in_ch, out_ch, kernel_size=1, bias=False)
            if in_ch != out_ch
            else nn.Identity()
        )

    def forward(self, x):
        identity = self.skip(x)
        out = self.relu1(self.norm1(self.conv1(x)))
        out = self.norm2(self.conv2(out))
        return self.relu2(out + identity)


class SEBlock(nn.Module):
    def __init__(self, ch, reduction=8):
        super().__init__()
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(ch, max(ch // reduction, 4)),
            nn.ReLU(inplace=True),
            nn.Linear(max(ch // reduction, 4), ch),
            nn.Sigmoid(),
        )

    def forward(self, x):
        w = self.pool(x).flatten(1)
        w = self.fc(w).view(-1, x.size(1), 1, 1)
        return x * w


class UNetResidual(nn.Module):
    def __init__(self, base=64):
        super().__init__()

        self.enc1 = ResConvBlock(3, base)
        self.pool1 = nn.MaxPool2d(2)

        self.enc2 = ResConvBlock(base, base * 2)
        self.pool2 = nn.MaxPool2d(2)

        self.enc3 = ResConvBlock(base * 2, base * 4)
        self.pool3 = nn.MaxPool2d(2)

        self.mid = ResConvBlock(base * 4, base * 8)

        self.up3 = nn.ConvTranspose2d(base * 8, base * 4, kernel_size=2, stride=2)
        self.dec3 = ResConvBlock(base * 8, base * 4)
        self.se3 = SEBlock(base * 4)

        self.up2 = nn.ConvTranspose2d(base * 4, base * 2, kernel_size=2, stride=2)
        self.dec2 = ResConvBlock(base * 4, base * 2)
        self.se2 = SEBlock(base * 2)

        self.up1 = nn.ConvTranspose2d(base * 2, base, kernel_size=2, stride=2)
        self.dec1 = ResConvBlock(base * 2, base)

        self.out_conv = nn.Conv2d(base, 3, kernel_size=1)

    def _align(self, tensor, ref):
        if tensor.shape[-2:] != ref.shape[-2:]:
            tensor = F.interpolate(
                tensor, size=ref.shape[-2:], mode="bilinear", align_corners=False
            )
        return tensor

    def forward(self, x):
        e1 = self.enc1(x)
        p1 = self.pool1(e1)
        e2 = self.enc2(p1)
        p2 = self.pool2(e2)
        e3 = self.enc3(p2)
        p3 = self.pool3(e3)

        m = self.mid(p3)

        u3 = self._align(self.up3(m), e3)
        d3 = self.se3(self.dec3(torch.cat([u3, e3], dim=1)))

        u2 = self._align(self.up2(d3), e2)
        d2 = self.se2(self.dec2(torch.cat([u2, e2], dim=1)))

        u1 = self._align(self.up1(d2), e1)
        d1 = self.dec1(torch.cat([u1, e1], dim=1))

        residual = self.out_conv(d1)
        return torch.clamp(x + residual, 0.0, 1.0)


def load_deblur_state_dict(path: str | Path, device: torch.device) -> dict:
    try:
        ckpt = torch.load(path, map_location=device, weights_only=False)
    except TypeError:
        ckpt = torch.load(path, map_location=device)
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        return ckpt["model_state_dict"]
    if isinstance(ckpt, dict):
        return ckpt
    raise ValueError("Invalid checkpoint format")
