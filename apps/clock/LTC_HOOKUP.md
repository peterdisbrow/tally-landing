# Timecode (Deity TC-1 via LTC audio) — hookup note

Plain-English setup for feeding a **Deity TC-1** into the Multi-Clock. (TC-1 first; other timecode sources can be added later.)

## What you need

1. **A way to get a line-level audio signal into the Mac.** Most Macs have no line input
   (the headphone jack is output-only or a headset-mic jack), so use one of:
   - **Recommended: a small USB audio interface with a line input** (any class-compliant one:
     Focusrite Scarlett Solo/2i2, Behringer UCA202, iRig, etc.). Plug it in over USB-C/USB-A — no driver needed.
   - **Okay: a USB-C / USB audio adapter with a 3.5mm mic/headset input** (TRRS). These expect a *mic-level*
     signal, so set the TC-1 to **A-OUT** (see below). If the meter is always red, the signal is too hot for it.
2. **A cable from the TC-1's locking 3.5mm port to that input.** The TC-1's port is TRS: **tip = LTC**,
   ring = float/mic, sleeve = ground. For a line input on an interface use a 3.5mm → 1/4" **TS (mono)** cable
   (or 3.5mm → RCA for the UCA202). The cable that ships with the TC-1 is a TRS 3.5mm cable; a 3.5mm-to-1/4" adapter on the end works.

## TC-1 settings

- **Out Type: `L-OUT`** (line-level timecode) when going into an interface *line* input. This is the normal setting.
- **Out Type: `A-OUT`** (mic-level timecode on the left channel, scratch mic on the right) only if you're stuck with a *mic* input.
- **Supported rates (all the TC-1 standard ones):** 23.98, 24, 25, 29.97, 29.97 DF, 30. **50/60 fps is not supported yet** (set the TC-1 to one of the above).
- **FPS:** set the TC-1 to the frame rate your show uses (e.g. **23.98**). The clock reads the real rate off the signal, so it shows `23.98 fps`, not `24`.
- The TC-1 must be running (synced or in Master Run); the clock only shows what it's sending.

## Level

The clock has a level meter under the timecode (and in the cell's settings). Aim for the **middle of the bar —
roughly -18 dB to -6 dB**. Bar amber / "LOW" → turn the interface's input gain up. Bar red / "TOO HOT" → turn the gain down
(or switch the TC-1 to A-OUT for a mic input). LTC is a loud square wave; it should never clip.

## On the Mac

1. Open the clock in **Chrome or Safari**: tallyconnect.app/multi-clock and **sign in to Tally**
   (this mode is for signed-in Tally users, like the ProPresenter/ATEM modes).
2. Click **+ Add** (or use an empty cell), open the cell's **gear → Mode → "Timecode (Deity TC-1)"**.
3. Press **Start timecode input**. Allow the **microphone** prompt (the browser calls any audio input a "microphone").
   If you said no by accident: click the lock icon in the address bar → allow Microphone → press **Try again**.
   If it still fails, check **System Settings → Privacy & Security → Microphone** and tick your browser.
4. In the cell's **gear**, pick your interface under **Timecode input (LTC)** instead of "System default input".

## How to test

- Plug in, start the clock mode, and watch the status line under the digits:
  - `NO SIGNAL` — nothing arriving: check the cable, the TC-1 Out Type, the interface input/gain.
  - `AUDIO PRESENT · NO TIMECODE` — sound is arriving but it isn't LTC (wrong input, mic level instead of line, scratch mic, etc.).
  - `LTC · 23.98 fps` with `HH:MM:SS:FF` counting — working. (Drop-frame shows `29.97 fps DF` with a `;` before the frames.)
- Compare against the TC-1's own display: the clock can be about **one frame behind** (it can only read a frame once it has fully arrived).
- Test with a second TC-1 as a reference: jam both to the same time and confirm they agree to within a frame.
- Stop the TC-1 (or pull the cable): the clock goes to `NO SIGNAL` after about a second.

## Jam (so you don't need the TC-1 plugged in all the time)

1. With the TC-1 connected and the clock showing `TC-1 · … fps · LIVE`, press **Jam**. It checks 48+ clean consecutive frames over about 3-4 seconds ("JAMMING… n/48 FRAMES").
2. Unplug the TC-1. The clock switches to **FREE-RUN** (amber dot) and keeps counting on the computer's clock (which your Mac keeps synced over the internet). It shows **jammed Xm ago**.
3. **Reload keeps the jam** (saved in this browser only; another computer/browser needs its own jam). A free-running clock does not use the microphone.
4. **Re-jam** (needs the TC-1 connected again) or **Clear jam** any time. Settings also show the live-vs-free-run difference in frames while the TC-1 is connected.
5. **Frame offset** in settings (−1f / +1f) is a fine trim in case your TC-1 display and the clock differ by a frame on your setup.

Re-jam before each show. If the Mac is asleep the clock still stays right (it uses wall-clock time), but a manual clock change on the Mac will shift the jam.

## It won't lock? Read the diagnostics line
With the clock in Timecode mode and listening, the cell shows a one-line verdict under the level meter, and **Settings** shows the full counters (input device, sample rate, channels, whether echo cancellation / noise suppression / AGC are really off, per-channel level, edges/s, how "steady" the signal is, the bit rate it implies, sync words found, rejected frames, glitches, frames decoded). Quick reading:
- **Input is silent** → wrong input device, cable, or the TC-1's output is off / at the wrong level (Out Type).
- **Audio present but not a timecode-like square wave** → wrong input (mic/room noise); pick the interface the TC-1 is plugged into.
- **Steady signal at ~4800 bits/s (≈60 fps)** → the TC-1 is outputting a faster-than-30 fps signal; set it to 29.97 / 29.97 DF / 30 and use ×2 for 59.94/60 shows.
- **Steady biphase signal but no sync words** → too distorted/clipped or processed; lower the level, keep processing off.
- **Sync words found but digits invalid / don't count up** → noisy signal.
- Both channels are decoded separately (LTC on only the left or right is fine, and a balanced +/- pair is fine); channels are never summed.
Copy the diagnostics lines into a bug report if it still won't lock.
