#!/usr/bin/env python3
"""Make an LHA archive without compression (method -lh0-, level 0 headers), which LhA on the
Amiga and lhasa read: Lhasa (the lha of Linux distributions) only extracts.

    tools/lha_lh0.py archivo.lha DIRECTORIO      # DIRECTORIO and everything in it, with its paths
    tools/lha_lh0.py archivo.lha DIR DIR.info    # several: directories (whole) and files
"""
import os
import struct
import sys
import time


def crc16(data: bytes) -> int:
    """CRC-16/ARC, the one of LHA"""
    crc = 0
    for b in data:
        crc ^= b
        for _ in range(8):
            crc = (crc >> 1) ^ 0xA001 if crc & 1 else crc >> 1
    return crc


def dos_time(t: float) -> int:
    lt = time.localtime(t)
    return (((lt.tm_year - 1980) << 25) | (lt.tm_mon << 21) | (lt.tm_mday << 16)
            | (lt.tm_hour << 11) | (lt.tm_min << 5) | (lt.tm_sec // 2))


def entry(name: str, data: bytes, mtime: float) -> bytes:
    fname = name.replace("/", "\\").encode("latin-1")
    body = (b"-lh0-" + struct.pack("<IIIBB", len(data), len(data), dos_time(mtime), 0x20, 0)
            + bytes([len(fname)]) + fname + struct.pack("<H", crc16(data)))
    header = bytes([len(body), sum(body) & 0xFF]) + body
    return header + data


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    archive = sys.argv[1]
    out = b""
    for top in (t.rstrip("/") for t in sys.argv[2:]):
        base = os.path.dirname(top)
        if os.path.isfile(top):
            with open(top, "rb") as fh:
                out += entry(os.path.relpath(top, base), fh.read(), os.path.getmtime(top))
            continue
        for root, dirs, files in os.walk(top):
            dirs.sort()
            for f in sorted(files):
                path = os.path.join(root, f)
                with open(path, "rb") as fh:
                    out += entry(os.path.relpath(path, base), fh.read(), os.path.getmtime(path))
    with open(archive, "wb") as fh:
        fh.write(out + b"\0")


if __name__ == "__main__":
    main()
