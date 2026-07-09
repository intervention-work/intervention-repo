# Hero video

Place your looping background clip here as **`hero.mp4`**.

## Brief

- 1080p, ~8–15 seconds, seamless loop
- Compressed aggressively: target **2–4 MB** so it streams instantly
  (`ffmpeg -i in.mov -c:v libx264 -crf 28 -preset slow -movflags +faststart -an hero.mp4`)
- No audio track — the hero is muted, autoplay
- Subject: water ripple, light through trees, slow drone over a path,
  hands held — anything ambient and warm. Avoid faces, anything clinical,
  anything that demands attention.

## Fallback

If the file is missing, the `<video>` tag silently fails and the dark hero
background still renders. So shipping without one is safe — the conversion
card and headline keep working.
