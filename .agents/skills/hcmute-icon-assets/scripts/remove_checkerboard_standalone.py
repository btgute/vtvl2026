#!/usr/bin/env python3
"""Convert light checkerboard backgrounds to alpha without external dependencies.
Uses sips to convert to/from 32-bit TGA and Python standard library for BFS flood fill.
"""

from collections import deque
from pathlib import Path
import struct
import subprocess
import sys


def is_background(r: int, g: int, b: int, a: int = 255) -> bool:
  if a == 0:
    return True
  bright = min(r, g, b) >= 218
  nearly_neutral = max(r, g, b) - min(r, g, b) <= 24
  return bright and nearly_neutral


def process_image(input_path: Path, output_path: Path) -> None:
  scratch_dir = Path("scratch")
  scratch_dir.mkdir(parents=True, exist_ok=True)
  temp_in_tga = scratch_dir / f"temp_in_{input_path.stem}.tga"
  temp_out_tga = scratch_dir / f"temp_out_{input_path.stem}.tga"

  # Convert input to TGA using sips
  subprocess.run(
      ["sips", "-s", "format", "tga", str(input_path), "--out", str(temp_in_tga)],
      check=True,
      stdout=subprocess.DEVNULL,
      stderr=subprocess.DEVNULL,
  )

  with open(temp_in_tga, "rb") as f:
    header = f.read(18)
    id_len = header[0]
    colormap_type = header[1]
    image_type = header[2]
    width = header[12] + header[13] * 256
    height = header[14] + header[15] * 256
    bpp = header[16]
    desc = header[17]

    if id_len > 0:
      f.read(id_len)

    raw_data = bytearray(f.read())

  bytes_per_pixel = bpp // 8
  is_top_down = bool(desc & 0x20)

  # Convert to standard top-down RGBA buffer
  pixels = bytearray(width * height * 4)

  for y in range(height):
    src_y = y if is_top_down else (height - 1 - y)
    for x in range(width):
      src_offset = (src_y * width + x) * bytes_per_pixel
      dst_offset = (y * width + x) * 4
      b = raw_data[src_offset]
      g = raw_data[src_offset + 1]
      r = raw_data[src_offset + 2]
      a = raw_data[src_offset + 3] if bytes_per_pixel == 4 else 255
      pixels[dst_offset] = r
      pixels[dst_offset + 1] = g
      pixels[dst_offset + 2] = b
      pixels[dst_offset + 3] = a

  def get_pixel(x: int, y: int):
    offset = (y * width + x) * 4
    return (
        pixels[offset],
        pixels[offset + 1],
        pixels[offset + 2],
        pixels[offset + 3],
    )

  def set_alpha_zero(x: int, y: int):
    offset = (y * width + x) * 4
    pixels[offset + 3] = 0

  # BFS Flood fill from edges
  visited = bytearray(width * height)
  queue = deque()

  for x in range(width):
    queue.append((x, 0))
    queue.append((x, height - 1))
  for y in range(height):
    queue.append((0, y))
    queue.append((width - 1, y))

  while queue:
    x, y = queue.popleft()
    idx = y * width + x
    if visited[idx]:
      continue
    visited[idx] = 1

    r, g, b, a = get_pixel(x, y)
    if not is_background(r, g, b, a):
      continue

    set_alpha_zero(x, y)

    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
      if 0 <= nx < width and 0 <= ny < height:
        nidx = ny * width + nx
        if not visited[nidx]:
          queue.append((nx, ny))

  # Remove enclosed checkerboard patterns
  for start_y in range(height):
    for start_x in range(width):
      sidx = start_y * width + start_x
      if visited[sidx]:
        continue
      sr, sg, sb, sa = get_pixel(start_x, start_y)
      if not is_background(sr, sg, sb, sa):
        continue

      component = []
      c_queue = deque([(start_x, start_y)])
      visited[sidx] = 1
      gray_count = 0
      white_count = 0

      while c_queue:
        cx, cy = c_queue.popleft()
        component.append((cx, cy))
        cr, cg, cb, ca = get_pixel(cx, cy)
        tone = (cr + cg + cb) / 3.0
        if 238 <= tone < 250:
          gray_count += 1
        elif tone >= 250:
          white_count += 1

        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
          if 0 <= nx < width and 0 <= ny < height:
            nidx = ny * width + nx
            if not visited[nidx]:
              nr, ng, nb, na = get_pixel(nx, ny)
              if is_background(nr, ng, nb, na):
                visited[nidx] = 1
                c_queue.append((nx, ny))

      size = len(component)
      checker_tones = gray_count + white_count
      if (
          size >= 64
          and gray_count / size >= 0.30
          and white_count / size >= 0.30
          and checker_tones / size >= 0.85
      ):
        for cx, cy in component:
          set_alpha_zero(cx, cy)

  # Write output 32-bit TGA (BGRA format, top-down)
  out_header = bytearray(18)
  out_header[2] = 2  # uncompressed true-color
  out_header[12] = width & 0xFF
  out_header[13] = (width >> 8) & 0xFF
  out_header[14] = height & 0xFF
  out_header[15] = (height >> 8) & 0xFF
  out_header[16] = 32  # 32 bpp
  out_header[17] = 0x28  # top-down, 8-bit alpha

  out_data = bytearray(width * height * 4)
  for y in range(height):
    for x in range(width):
      offset = (y * width + x) * 4
      r = pixels[offset]
      g = pixels[offset + 1]
      b = pixels[offset + 2]
      a = pixels[offset + 3]
      out_data[offset] = b
      out_data[offset + 1] = g
      out_data[offset + 2] = r
      out_data[offset + 3] = a

  with open(temp_out_tga, "wb") as f:
    f.write(out_header)
    f.write(out_data)

  output_path.parent.mkdir(parents=True, exist_ok=True)
  # Convert TGA to PNG using sips
  subprocess.run(
      ["sips", "-s", "format", "png", str(temp_out_tga), "--out", str(output_path)],
      check=True,
      stdout=subprocess.DEVNULL,
      stderr=subprocess.DEVNULL,
  )
  print(f"Successfully created: {output_path}")


if __name__ == "__main__":
  if len(sys.argv) < 3:
    print("Usage: python3 remove_checkerboard_standalone.py <input> <output>")
    sys.exit(1)
  process_image(Path(sys.argv[1]), Path(sys.argv[2]))
