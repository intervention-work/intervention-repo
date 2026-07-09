# Ambient sound

Drop a single looping ambient MP3 here named **`ambient.mp3`** to enable the sound
toggle in the navigation.

The toggle gracefully no-ops if the file is missing — the button will appear in a
disabled state and never call `Howl.play()`. So shipping without a sound file is
safe; users will simply see "Sound off" and the toggle stays inert.

## Sourcing

Looking for a royalty-free clip in the 1–3 minute range that loops seamlessly:

- **Pixabay** — search `forest ambience loop` or `gentle stream loop`
  https://pixabay.com/sound-effects/search/ambient-nature/
- **Freesound.org** — search `nature loop calm` (CC0 or CC-BY)
- **Mixkit** — https://mixkit.co/free-sound-effects/ambient/

## Audio brief

- 1–3 minutes long, seamless loop
- 96 kbps mono or 128 kbps stereo MP3 (keeps the file under ~2 MB)
- Calm, low-tonal-density: a single creek, a soft rain, low wind, light forest
- **Avoid** distinct bird calls, music, melody, drone, or anything that grabs
  attention. The sound should feel like a room, not a track.
- Mastered quietly — peaks around -18 LUFS. The component plays at volume `0.18`
  on top of that.

## File path

```
public/sounds/ambient.mp3
```

That's it. Hot reload, click the speaker icon in the nav, and you're live.
