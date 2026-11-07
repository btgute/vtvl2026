#!/usr/bin/env python3
"""Clean checkerboard background and convert to true RGBA transparent PNG.
Works with zero external dependencies (uses macOS sips + Python stdlib).
"""

from collections import deque
from pathlib import Path
import struct
import subprocess
import sys
import zlib


def is_background(r: int, g: int, b: int, a: int = 255) -> bool:
  if a == 0:
    return True
  bright = min(r, g, b) >= 205
  nearly_neutral = max(r, g, b) - min(r, g, b) <= 24
  return bright and nearly_neutral


def write_png(
    width: int, height: int, rgba_data: bytearray, out_path: Path
) -> None:
  def make_chunk(chunk_type: bytes, data: bytes) -> bytes:
    return (
        struct.pack('>I', len(data))
        + chunk_type
        + data
        + struct.pack('>I', zlib.crc32(chunk_type + data) & 0xFFFFFFFF)
    )

  header = b'\x89PNG\r\n\x1a\n'
  ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
  ihdr = make_chunk(b'IHDR', ihdr_data)

  raw = bytearray()
  row_stride = width * 4
  for y in range(height):
    raw.append(0)  # Filter byte 0 (None)
    raw.extend(rgba_data[y * row_stride : (y + 1) * row_stride])

  idat = make_chunk(b'IDAT', zlib.compress(bytes(raw), level=6))
  iend = make_chunk(b'IEND', b'')

  out_path.parent.mkdir(parents=True, exist_ok=True)
  with open(out_path, 'wb') as f:
    f.write(header + ihdr + idat + iend)


def process_image(input_path: Path, output_path: Path) -> None:
  scratch_dir = Path('scratch')
  scratch_dir.mkdir(parents=True, exist_ok=True)
  temp_bmp = scratch_dir / f'temp_{input_path.stem}.bmp'

  # Convert to BMP using sips
  subprocess.run(
      ['sips', '-s', 'format', 'bmp', str(input_path), '--out', str(temp_bmp)],
      check=True,
      stdout=subprocess.DEVNULL,
      stderr=subprocess.DEVNULL,
  )

  with open(temp_bmp, 'rb') as f:
    bmp_data = f.read()

  offset = struct.unpack('<I', bmp_data[10:14])[0]
  biSize, w, raw_h, planes, bpp = struct.unpack('<IiiHH', bmp_data[14:30])
  is_top_down = raw_h < 0
  h = abs(raw_h)

  bytes_per_pixel = bpp // 8
  row_size = ((w * bytes_per_pixel + 3) // 4) * 4

  rgba = bytearray(w * h * 4)

  for y in range(h):
    src_y = y if is_top_down else (h - 1 - y)
    src_row_offset = offset + src_y * row_size
    dst_row_offset = y * w * 4

    for x in range(w):
      px_offset = src_row_offset + x * bytes_per_pixel
      b = bmp_data[px_offset]
      g = bmp_data[px_offset + 1]
      r = bmp_data[px_offset + 2]
      a = bmp_data[px_offset + 3] if bytes_per_pixel == 4 else 255

      d_offset = dst_row_offset + x * 4
      rgba[d_offset] = r
      rgba[d_offset + 1] = g
      rgba[d_offset + 2] = b
      rgba[d_offset + 3] = a

  def get_pixel(x: int, y: int):
    idx = (y * w + x) * 4
    return rgba[idx], rgba[idx + 1], rgba[idx + 2], rgba[idx + 3]

  def set_transparent(x: int, y: int):
    idx = (y * w + x) * 4
    rgba[idx + 3] = 0

  # BFS flood fill from outer edges
  visited = bytearray(w * h)
  queue = deque()

  for x in range(w):
    queue.append((x, 0))
    queue.append((x, h - 1))
  for y in range(h):
    queue.append((0, y))
    queue.append((w - 1, y))

  while queue:
    x, y = queue.popleft()
    idx = y * w + x
    if visited[idx]:
      continue
    visited[idx] = 1

    r, g, b, a = get_pixel(x, y)
    if not is_background(r, g, b, a):
      continue

    set_transparent(x, y)

    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
      if 0 <= nx < w and 0 <= ny < h:
        nidx = ny * w + nx
        if not visited[nidx]:
          queue.append((nx, ny))

  # Remove enclosed checkerboard patterns
  for start_y in range(h):
    for start_x in range(w):
      sidx = start_y * w + start_x
      if visited[sidx]:
        continue
      sr, sg, sb, sa = get_pixel(start_x, start_y)
      if not is_background(sr, sg, sb, sa):
        continue

      comp = []
      c_queue = deque([(start_x, start_y)])
      visited[sidx] = 1
      gray_count = 0
      white_count = 0

      while c_queue:
        cx, cy = c_queue.popleft()
        comp.append((cx, cy))
        cr, cg, cb, _ = get_pixel(cx, cy)
        tone = (cr + cg + cb) / 3.0
        if 180 <= tone < 250:
          gray_count += 1
        elif tone >= 250:
          white_count += 1

        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
          if 0 <= nx < w and 0 <= ny < h:
            nidx = ny * w + nx
            if not visited[nidx]:
              nr, ng, nb, na = get_pixel(nx, ny)
              if is_background(nr, ng, nb, na):
                visited[nidx] = 1
                c_queue.append((nx, ny))

      size = len(comp)
      checker_tones = gray_count + white_count
      if (
          size >= 16
          and gray_count / size >= 0.25
          and white_count / size >= 0.25
          and checker_tones / size >= 0.80
      ):
        for cx, cy in comp:
          set_transparent(cx, cy)

  # Remove any disconnected components that don't belong to the main object
  opaque_visited = bytearray(w * h)
  for y in range(h):
    for x in range(w):
      idx = y * w + x
      if opaque_visited[idx] or rgba[idx * 4 + 3] == 0:
        continue
      comp = []
      q = deque([(x, y)])
      opaque_visited[idx] = 1
      has_brand_color = False
      touches_center = False

      while q:
        cx, cy = q.popleft()
        comp.append((cx, cy))
        c_idx = (cy * w + cx) * 4
        cr = rgba[c_idx]
        cg = rgba[c_idx + 1]
        cb = rgba[c_idx + 2]

        # Check for brand colors (HCM-UTE blue or red)
        if (cb > 100 and cb - cr > 30) or (cr > 140 and cr - cg > 50 and cr - cb > 50):
          has_brand_color = True

        # Check if inside central object area
        if abs(cx - w // 2) < 180 and abs(cy - h // 2) < 180:
          touches_center = True

        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
          if 0 <= nx < w and 0 <= ny < h:
            nidx = ny * w + nx
            if not opaque_visited[nidx] and rgba[nidx * 4 + 3] > 0:
              opaque_visited[nidx] = 1
              q.append((nx, ny))

      # If the component is not part of the main brand object, clear it
      if not has_brand_color and not touches_center:
        for px, py in comp:
          set_transparent(px, py)
      elif len(comp) < 5000 and not has_brand_color:
        for px, py in comp:
          set_transparent(px, py)

  # Write out final PNG
  write_png(w, h, rgba, output_path)
  print(f'Done! Saved {output_path} ({w}x{h})')


if __name__ == '__main__':
  if len(sys.argv) < 3:
    print('Usage: python3 clean_checkerboard.py <input> <output>')
    sys.exit(1)
  process_image(Path(sys.argv[1]), Path(sys.argv[2]))
