#!/usr/bin/env bash
# Convert a GIF (or any video) into a small, web-friendly looping MP4 for the
# Research/Projects sections. Typically 20–50x smaller than the GIF.
#
# Usage: scripts/gif-to-mp4.sh input.gif [output.mp4] [max-width]
#   default output: public/media/papers/<input-name>.mp4, default width: 960
set -euo pipefail

in="${1:?usage: $0 input.gif [output.mp4] [max-width]}"
name="$(basename "${in%.*}")"
out="${2:-public/media/papers/${name}.mp4}"
width="${3:-960}"

mkdir -p "$(dirname "$out")"
ffmpeg -y -i "$in" \
  -movflags +faststart -an \
  -c:v libx264 -pix_fmt yuv420p -crf 26 -preset slow \
  -vf "scale='min(${width},iw)':-2:flags=lanczos,fps=30" \
  "$out"

echo "Wrote $out ($(du -h "$out" | cut -f1))"
