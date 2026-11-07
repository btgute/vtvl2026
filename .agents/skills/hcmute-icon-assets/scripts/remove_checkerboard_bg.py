#!/usr/bin/env python3
"""Convert light checkerboard backgrounds to alpha.

Use this only for generated icon PNGs where the transparency preview was baked
as a light gray/white checkerboard. It removes the edge-connected background
and checker-like components trapped inside closed object openings. Interior
white icon details are preserved by requiring enclosed components to contain
the characteristic balanced light-gray/near-white checker palette.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True
    bright = min(r, g, b) >= 218
    nearly_neutral = max(r, g, b) - min(r, g, b) <= 24
    return bright and nearly_neutral


def remove_enclosed_checker_components(
    pixels: object,
    width: int,
    height: int,
    visited: set[tuple[int, int]],
) -> None:
    """Remove checker-pattern components enclosed by object geometry.

    A real white object surface normally contains shaded midtones and a smooth
    gradient. The generated checker preview instead contains a balanced mix of
    light-gray and near-white pixels. Requiring both tone bands prevents broad
    white cards, controls, and highlights from being mistaken for background.
    """

    for start_y in range(height):
        for start_x in range(width):
            start = (start_x, start_y)
            if start in visited or not is_background(pixels[start_x, start_y]):
                continue

            component: list[tuple[int, int]] = []
            queue: deque[tuple[int, int]] = deque([start])
            visited.add(start)
            gray_count = 0
            white_count = 0

            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                r, g, b, _ = pixels[x, y]
                tone = (r + g + b) / 3
                if 238 <= tone < 250:
                    gray_count += 1
                elif tone >= 250:
                    white_count += 1

                for neighbor in (
                    (x + 1, y),
                    (x - 1, y),
                    (x, y + 1),
                    (x, y - 1),
                ):
                    nx, ny = neighbor
                    if (
                        0 <= nx < width
                        and 0 <= ny < height
                        and neighbor not in visited
                        and is_background(pixels[nx, ny])
                    ):
                        visited.add(neighbor)
                        queue.append(neighbor)

            size = len(component)
            checker_tones = gray_count + white_count
            checker_like = (
                size >= 64
                and gray_count / size >= 0.30
                and white_count / size >= 0.30
                and checker_tones / size >= 0.85
            )
            if checker_like:
                for x, y in component:
                    pixels[x, y] = (255, 255, 255, 0)


def remove_bg(input_path: Path, output_path: Path) -> None:
    image = Image.open(input_path).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    seen: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or not (0 <= x < width and 0 <= y < height):
            continue
        seen.add((x, y))
        if not is_background(pixels[x, y]):
            continue
        pixels[x, y] = (255, 255, 255, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    remove_enclosed_checker_components(pixels, width, height, seen)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    remove_bg(args.input, args.output)


if __name__ == "__main__":
    main()
