#!/usr/bin/env python3
"""Vigenco soundtrack synth.

Reads film.json (exported by the film: bpm, duration, sections, cues) and writes a 48 kHz stereo WAV:
an original 120 BPM music bed arranged to the film's sections (sparse intro, groove, snare build,
drop on the film's big moment, ringing outro) plus synthesized UI sound effects, each placed so its
own peak lands on its cue. Everything is generated from scratch with numpy: no samples, no licences.

Optional: spec.audio.music = path to your own track (mixed instead of the synthesized bed),
spec.audio.musicOffset = seconds into that track to start from.
"""
import json, sys, wave, os
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def env_ad(n, a, d):
    """attack (s) then exponential decay with time constant d (s)."""
    t = np.arange(n) / SR
    e = np.exp(-np.maximum(t - a, 0) / d)
    if a > 0:
        e = np.where(t < a, t / a, e)
    return e


def band_noise(d, lo, hi, seed=None):
    n = int(d * SR)
    g = np.random.default_rng(seed) if seed is not None else rng
    x = g.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    # soft edges
    m = np.convolve(m, np.hanning(31) / np.hanning(31).sum(), mode='same')
    y = np.fft.irfft(X * m, n)
    return y / (np.max(np.abs(y)) + 1e-9)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def saw(freq, d, harm=12, bright=1.0):
    t = t_axis(d)
    y = np.zeros_like(t)
    for k in range(1, harm + 1):
        if freq * k > 16000:
            break
        y += np.sin(2 * np.pi * freq * k * t) / k * (bright ** (k - 1))
    return y / 1.7


def sine(freq, d, phase=0.0):
    return np.sin(2 * np.pi * freq * t_axis(d) + phase)


def sweep(f0, f1, d, curve=6.0):
    t = t_axis(d)
    f = f1 + (f0 - f1) * np.exp(-t * curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


class Bus:
    def __init__(self, dur):
        self.L = np.zeros(int((dur + 2) * SR))
        self.R = np.zeros_like(self.L)

    def add(self, x, t, gain=1.0, pan=0.0, align_peak=False):
        if x is None or len(x) == 0:
            return
        off = int(np.argmax(np.abs(x))) if align_peak else 0
        i = int(round(t * SR)) - off
        if i < 0:
            x = x[-i:]
            i = 0
        j = min(len(self.L), i + len(x))
        if j <= i:
            return
        x = np.nan_to_num(x[: j - i] * gain)
        pan = float(np.clip(np.nan_to_num(pan), -1.0, 1.0))   # films may pass any n; keep pan in range
        self.L[i:j] += x * np.sqrt(0.5 * (1 - pan))
        self.R[i:j] += x * np.sqrt(0.5 * (1 + pan))


# ---------------------------------------------------------------- instruments
def kick(strength=1.0):
    d = 0.42
    body = sweep(150, 46, d, curve=28) * env_ad(int(d * SR), 0.001, 0.16)
    click = band_noise(0.012, 2000, 8000) * env_ad(int(0.012 * SR), 0.0005, 0.003)
    body[: len(click)] += click * 0.35
    return body * strength


def snare(strength=1.0):
    d = 0.22
    n = band_noise(d, 1200, 9000) * env_ad(int(d * SR), 0.0008, 0.055)
    tone = sine(196, d) * env_ad(int(d * SR), 0.0005, 0.04)
    return (n * 0.8 + tone * 0.45) * strength


def clap():
    d = 0.25
    n = band_noise(d, 900, 6000)
    e = np.zeros(int(d * SR))
    for k, o in enumerate([0, 0.011, 0.022]):
        i = int(o * SR)
        e[i:] += env_ad(len(e) - i, 0.0005, 0.012 if k < 2 else 0.07)
    return n * e * 0.8


def hat(open_=False):
    d = 0.32 if open_ else 0.06
    return band_noise(d, 7000, 15000) * env_ad(int(d * SR), 0.0005, 0.09 if open_ else 0.014) * 0.35


def crash():
    d = 2.2
    return band_noise(d, 4000, 16000) * env_ad(int(d * SR), 0.002, 0.6) * 0.5


def pad(notes, d, bright=0.55):
    y = np.zeros(int(d * SR))
    for n in notes:
        for det in (-0.08, 0.08):
            y += saw(midi(n + det), d, harm=8, bright=bright)
    a = min(0.35, d * 0.4)
    e = np.minimum(1, t_axis(d) / a) * np.minimum(1, (d - t_axis(d)) / 0.25)
    return y * e / (len(notes) * 2)


def bass(note, d):
    y = saw(midi(note), d, harm=6, bright=0.5) * 0.7 + sine(midi(note - 12), d) * 0.6
    return y * env_ad(len(y), 0.004, max(0.08, d * 0.6))


def stab(notes, d=0.5):
    y = np.zeros(int(d * SR))
    for n in notes:
        y += saw(midi(n), d, harm=10, bright=0.7)
    return y * env_ad(len(y), 0.002, 0.18) / len(notes)


def riser(d):
    n = int(d * SR)
    y = np.zeros(n)
    steps = 24
    for k in range(steps):
        lo = 400 + 6000 * (k / steps) ** 2
        seg = band_noise(d / steps + 0.02, lo, lo * 2.2)
        i = int(k * n / steps)
        j = min(n, i + len(seg))
        y[i:j] += seg[: j - i] * np.hanning(j - i)
    return y * np.linspace(0.05, 1, n) ** 2 * 0.5


# ---------------------------------------------------------------- sound effects
PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91]  # A minor pentatonic


def pluck(note, d=0.5, bright=0.6):
    f = midi(note)
    y = sine(f, d) + 0.35 * sine(2 * f, d) * bright + 0.12 * sine(3 * f, d) * bright
    return y * env_ad(len(y), 0.002, d / 4) * 0.5


def sfx_click():
    a = band_noise(0.01, 2500, 9000, seed=1) * env_ad(480, 0.0003, 0.0018)
    tone = sine(3200, 0.012) * env_ad(576, 0.0003, 0.002) * 0.3
    a = a + tone[: len(a)]
    rel = band_noise(0.008, 3000, 10000, seed=2) * env_ad(384, 0.0003, 0.0015) * 0.55
    y = np.zeros(int(0.1 * SR))
    y[: len(a)] += a
    i = int(0.07 * SR)
    y[i:i + len(rel)] += rel
    return y * 0.9


def sfx_key(n):
    g = np.random.default_rng(100 + n)
    lo = 1800 + g.random() * 1200
    y = band_noise(0.014, lo, lo * 3, seed=200 + n) * env_ad(int(0.014 * SR), 0.0003, 0.0022)
    return y * (0.35 + 0.15 * g.random())


def sfx_whoosh(v=1.0, d=0.34):
    n = int(d * SR)
    y = np.zeros(n)
    steps = 16
    for k in range(steps):
        c = 500 + 3500 * np.sin(np.pi * k / steps)
        seg = band_noise(d / steps + 0.03, c * 0.6, c * 1.6, seed=300 + k)
        i = int(k * n / steps)
        j = min(n, i + len(seg))
        y[i:j] += seg[: j - i] * np.hanning(j - i)
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    return y * e * 0.35 * v


def sfx_chime(notes, d=1.2):
    y = np.zeros(int((d + 0.1 * len(notes)) * SR))
    for k, n in enumerate(notes):
        p = pluck(n, d, bright=0.4)
        i = int(k * 0.06 * SR)
        y[i:i + len(p)] += p
    return y * 0.7


def sfx_tick(n):
    f = 2400 + (n % 3) * 180
    return sine(f, 0.02) * env_ad(int(0.02 * SR), 0.0003, 0.004) * 0.22


def sfx_thump(n):
    d = 0.45
    body = sweep(120, 48, d, curve=20) * env_ad(int(d * SR), 0.001, 0.12)
    hit = band_noise(0.03, 300, 5000, seed=400 + n) * env_ad(int(0.03 * SR), 0.0005, 0.008)
    body[: len(hit)] += hit * 0.5
    tone = pluck(PENTA[(n * 2) % len(PENTA)] - 12, 0.4, 0.3) * 0.5
    body[: len(tone)] += tone
    return body


def sfx_drag(d):
    d = max(0.1, d)
    y = band_noise(d, 1500, 5000, seed=9) * 0.08
    e = np.minimum(1, t_axis(d) / 0.05) * np.minimum(1, (d - t_axis(d)) / 0.05)
    return y * e


def sfx_impact():
    d = 1.6
    sub = sweep(90, 32, d, curve=4) * env_ad(int(d * SR), 0.002, 0.45)
    n = band_noise(0.5, 80, 3000, seed=11) * env_ad(int(0.5 * SR), 0.001, 0.08)
    sub[: len(n)] += n * 0.6
    return sub * 0.9


def sfx_shimmer():
    notes = [81, 84, 88, 91, 93, 96]
    y = np.zeros(int(2.2 * SR))
    for k, n in enumerate(notes):
        p = sine(midi(n), 1.6) * env_ad(int(1.6 * SR), 0.004, 0.5) * 0.18
        i = int(k * 0.045 * SR)
        y[i:i + len(p)] += p
    return y


# ---------------------------------------------------------------- arrangement
def build_music(film):
    bpm = film['bpm']
    spb = 60 / bpm
    dur = film['duration']
    S = film.get('sections') or {}
    music = Bus(dur)
    # Sections are optional for bespoke films: sensible defaults on the beat grid.
    snap = lambda x: round(x / spb) * spb
    intro_end = snap(S['intro'][1]) if 'intro' in S else min(snap(4 * spb), dur / 4)
    out0 = snap(S['outro'][0]) if 'outro' in S else max(intro_end + 4 * spb, snap(dur - 6 * spb))
    drop = snap(S['drop'][0]) if 'drop' in S else (snap(S['logos'][0]) if 'logos' in S else snap(intro_end + (out0 - intro_end) * 0.62))
    drop = min(max(drop, intro_end + 2 * spb), out0)
    feats = S.get('features', [intro_end + 4 * spb, drop])
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    roots = [45, 41, 48, 43]
    nb = int(np.ceil(dur / spb)) + 1

    for k in range(nb):
        t = k * spb
        bar, beat = divmod(k, 4)
        ch = chords[bar % 4]
        root = roots[bar % 4]
        in_build = drop - 2 * spb <= t < drop
        in_drop = drop <= t < out0 + 2 * spb
        groove = intro_end <= t < drop - 2 * spb
        full = feats[0] <= t < drop - 2 * spb
        ending = t >= out0 + 2 * spb

        if beat == 0 and t < out0 + 2 * spb:
            music.add(pad([n + 12 for n in ch], 4 * spb + 0.3, bright=0.45 if not in_drop else 0.6), t, 0.22)
        if t < intro_end:
            if beat == 0:
                music.add(kick(0.55), t, 0.8)
            continue
        if ending:
            continue
        # kick
        if not (in_build and t >= drop - 0.5 * spb):
            music.add(kick(1.0 if in_drop or full else 0.75), t, 0.9)
        # hats
        if groove or in_drop:
            music.add(hat(), t + spb / 2, 0.8, pan=0.25)
            if full or in_drop:
                music.add(hat(), t + spb / 4, 0.35, pan=-0.2)
                music.add(hat(), t + 3 * spb / 4, 0.35, pan=-0.2)
        if in_drop:
            music.add(hat(True), t + spb / 2, 0.35, pan=0.3)
        # backbeat
        if (full or in_drop) and beat in (1, 3):
            music.add(clap(), t, 0.7)
        # bass
        if groove or in_drop:
            music.add(bass(root, spb * 0.45), t + spb / 2, 0.55)
            if in_drop or full:
                music.add(bass(root + (7 if beat == 3 else 0), spb * 0.3), t + 3 * spb / 4, 0.4)

    # snare build into the drop: 8ths -> 16ths -> 32nds
    tb = drop - 2 * spb
    hits = [tb + i * spb / 2 for i in range(2)] + [tb + spb + i * spb / 4 for i in range(2)] + [tb + 1.5 * spb + i * spb / 8 for i in range(4)]
    for i, h in enumerate(hits):
        music.add(snare(0.4 + 0.6 * i / len(hits)), h, 0.6)
    music.add(riser(2 * spb), tb, 0.5)
    # drop
    music.add(crash(), drop, 0.55)
    music.add(stab([n + 12 for n in chords[0]] + [chords[0][0] + 24], 0.6), drop, 0.5)
    # outro: final chord rings out
    tf = out0 + 2 * spb
    music.add(kick(1.0), tf, 0.9)
    music.add(pad([57, 64, 69, 72, 76], max(1.0, dur - tf + 0.6), bright=0.5), tf, 0.32)
    music.add(crash(), tf, 0.3)
    return music


def build_sfx(film):
    sfx = Bus(film['duration'])
    for c in film['cues']:
        k, t = c.get('k'), float(c.get('t', 0))
        try:
            n = int(c.get('n', 0))
        except (TypeError, ValueError):
            n = 0
        if k == 'born':
            sfx.add(pluck(PENTA[0] + 12, 0.4), t, 0.5, align_peak=True)
        elif k in ('pop', 'swap'):
            sfx.add(pluck(PENTA[(2 + 2 * n) % len(PENTA)], 0.6), t, 0.55, pan=((n % 3) - 1) * 0.2, align_peak=True)
            sfx.add(sfx_whoosh(0.5, 0.22), t, 0.6, align_peak=True)
        elif k == 'whoosh':
            sfx.add(sfx_whoosh(c.get('v', 1.0)), t, 0.8, align_peak=True)
        elif k == 'click':
            sfx.add(sfx_click(), t, 0.9, pan=0.15, align_peak=True)
        elif k == 'key':
            sfx.add(sfx_key(n), t, 0.8, pan=-0.1 + 0.2 * ((n * 37) % 10) / 10, align_peak=True)
        elif k == 'toggle':
            sfx.add(sfx_click(), t, 0.9, align_peak=True)
            sfx.add(pluck(PENTA[6], 0.35, 0.2), t + 0.04, 0.35, align_peak=True)
        elif k == 'drag':
            sfx.add(sfx_drag(c.get('d', 0.5)), t, 1.0)
        elif k == 'release':
            sfx.add(sfx_click()[: int(0.05 * SR)], t, 0.6, align_peak=True)
        elif k == 'check':
            sfx.add(sfx_chime([PENTA[3], PENTA[5], PENTA[7]]), t, 0.6, align_peak=True)
        elif k == 'tick':
            sfx.add(sfx_tick(n), t, 0.9, align_peak=True)
        elif k == 'settle':
            sfx.add(pluck(PENTA[7], 0.8, 0.3), t, 0.4, align_peak=True)
        elif k == 'drop':
            sfx.add(sfx_impact(), t, 0.7, align_peak=True)
        elif k == 'slam':
            sfx.add(sfx_thump(n), t, 0.75, pan=((n % 3) - 1) * 0.25, align_peak=True)
        elif k == 'cta':
            sfx.add(sfx_click(), t, 1.0, align_peak=True)
            sfx.add(sfx_chime([PENTA[5], PENTA[7], PENTA[9]], 1.4), t + 0.03, 0.5, align_peak=True)
        elif k == 'shimmer':
            sfx.add(sfx_shimmer(), t, 0.8)
        elif k == 'note':
            sfx.add(pluck(PENTA[n % len(PENTA)], 0.6), t, 0.5, align_peak=True)
        elif k == 'alert':
            for i in range(3):
                sfx.add(pluck(PENTA[7] + (0 if i % 2 == 0 else -5), 0.25, 0.8), t + i * 0.12, 0.5, align_peak=True)
        elif k == 'riser':
            sfx.add(riser(max(0.3, c.get('d', 1.0))), t, 0.6)
        else:
            sfx.add(sfx_click(), t, 0.5, align_peak=True)   # unknown kind: a soft click rather than silence
    return sfx


def load_music_file(path, offset, dur):
    """Decode a user-supplied track with ffmpeg to float stereo."""
    import subprocess
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(offset), '-i', path, '-t', str(dur + 1), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         check=True, capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
    b = Bus(dur)
    n = min(len(b.L), len(a))
    b.L[:n], b.R[:n] = a[:n, 0], a[:n, 1]
    return b


def main():
    film = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    dur = film['duration']
    spec = film.get('spec', {})
    au = spec.get('audio', {}) or {}
    if au.get('music') and os.path.exists(au['music']):
        music = load_music_file(au['music'], au.get('musicOffset', 0), dur)
        mg = 0.6
    else:
        music = build_music(film)
        mg = 0.5
    sfx = build_sfx(film)
    n = int((dur + 0.05) * SR)
    L = music.L[:n] * mg + sfx.L[:n] * 0.62
    R = music.R[:n] * mg + sfx.R[:n] * 0.62
    # fade the very end so nothing clicks
    f = int(0.35 * SR)
    fade = np.linspace(1, 0, f) ** 2
    L[-f:] *= fade
    R[-f:] *= fade
    L, R = np.nan_to_num(L), np.nan_to_num(R)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-9)
    if peak < 1e-4:
        sys.exit('audio: the mix is silent, refusing to write it')
    g = 0.93 / peak
    st = np.stack([L * g, R * g], axis=1)
    pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
    with wave.open(out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'audio: {dur:.2f}s, {len(film["cues"])} cues -> {out}')


if __name__ == '__main__':
    main()
