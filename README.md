# Vigenco

**Spec masuk, MP4 keluar.** Tulis satu file JSON, jalankan GitHub Actions, dan dapatkan video motion
vertikal 60 fps lengkap dengan musik dan efek suara. Tanpa After Effects, tanpa template editor,
tanpa AI video model: setiap frame adalah HTML yang dihitung dari waktu (`seek(t)`).

Tipe video pertama: **`launch`** (video peluncuran produk).

```
jobs/xxx.json ──► types/launch (HTML film, seek(t)) ──► Playwright: N subframe per frame
             ──► ffmpeg tmix (motion blur asli) ──► H.264 60 fps ──► + soundtrack hasil synth ──► out/xxx.mp4
```

## Cara pakai

### Lewat GitHub (tanpa install apa pun)
1. Buat file baru di `jobs/`, misalnya salin `jobs/vigenco-launch.json` lalu ubah isinya.
2. Commit ke `main`. Workflow **Render videos** otomatis merender job yang baru atau berubah.
   Atau buka tab **Actions → Render videos → Run workflow**, pilih file job dan kualitas.
3. Setelah selesai (± 5–10 menit), unduh MP4 dari bagian **Artifacts** di halaman run.

### Lokal
```bash
npm install
npx playwright install chromium
pip install -r requirements.txt        # numpy, untuk audio

node bin/vigenco.mjs render jobs/vigenco-launch.json                  # → out/vigenco-launch.mp4
node bin/vigenco.mjs render jobs/vigenco-launch.json --quality draft  # preview cepat 30 fps
node bin/vigenco.mjs snap   jobs/vigenco-launch.json                  # 1 still per beat + contact sheet
```
Butuh Node ≥ 20, Python 3 + numpy, dan ffmpeg.

| Kualitas | Frame rate | Motion blur | Perkiraan waktu render (24 detik video, 2 core) |
|---|---|---|---|
| `draft` | 30 fps | tidak | ± 1 menit |
| `standard` (default) | 60 fps | 2 subframe | ± 5 menit |
| `high` | 60 fps | 4 subframe | ± 10 menit |

## Spec tipe `launch`

```jsonc
{
  "type": "launch",
  "format": "vertical",            // vertical 1080×1920 · landscape 1920×1080 · square 1080×1080
  "quality": "standard",
  "cursorName": "Kamu",            // label kursor yang "mengklik" semuanya
  "brand": {
    "name": "Vigenco", "mark": "V", "url": "vigenco.app",
    "colors": { "bg": "#F5F3EF", "ink": "#111827", "surface": "#FFFFFF",
                "accent": ["#6C5CE7", "#E35C91", "#FF8A3D"] }
  },
  "intro":  { "lines": ["Bikin video", "tanpa edit", "sama sekali."] },   // 1–3 potong headline
  "brief":  { "placeholder": "Mau video apa hari ini?", "text": "Video launch untuk kedai kopiku", "button": "Buat" },
  "features": [                    // maksimal 3, masing-masing punya satu micro-interaction
    { "icon": "wand", "title": "…", "desc": "…", "widget": "toggle", "label": "Mode sutradara" },
    { "icon": "bolt", "title": "…", "desc": "…", "widget": "slider", "label": "Kecepatan", "value": 10, "suffix": "x" },
    { "icon": "play", "title": "…", "desc": "…", "widget": "tabs", "tabs": ["TikTok", "Reels", "Shorts"] }
  ],
  "stat":   { "kicker": "Sejak beta", "value": 12480, "label": "video sudah dirender", "prefix": "", "suffix": "" },
  "logosLabel": "Dipakai oleh",
  "logos":  ["…", "…"],            // maksimal 6, satu per hentakan beat
  "outro":  { "tagline": "Ide masuk, video keluar.", "cta": "vigenco.app" },
  "audio":  { "music": "assets/lagu.mp3", "musicOffset": 0 }   // opsional; default musik di-synth sendiri
}
```

Ikon yang tersedia: `spark` `bolt` `chart` `clock` `shield` `heart` `globe` `play` `users` `wand` `check`.
Bagian `stat` dan `logos` boleh dihapus; filmnya menyesuaikan durasi sendiri.

## Alur filmnya

Satu bentuk yang tidak pernah terpotong (*one shape, never cut*): titik → headline pill → kolom prompt
yang diketik kursor → loader → centang → tiga kartu fitur (toggle, slider, tabs) → odometer angka
saat *drop* musik → logo pelanggan satu per hentakan → brand mark + wordmark + CTA yang diklik.
Semua perpindahan adalah morph dengan spring, isi berganti dengan blur singkat, kamera membingkai tiap state,
dan setiap efek suara jatuh tepat di beat 120 BPM.

## Struktur repo

| Path | Isi |
|---|---|
| `bin/vigenco.mjs` | CLI: `render` dan `snap` |
| `src/render.mjs` | Renderer: Playwright subframe → ffmpeg motion blur → MP4 (dipakai ulang nanti oleh worker SaaS) |
| `src/audio/synth.py` | Musik dan SFX hasil synth numpy, ditempatkan dari cue yang diekspor film |
| `types/_shared/motion.js` | Spring, Track, swap blur, warna: primitif untuk semua tipe video |
| `types/launch/` | Tipe video `launch` |
| `jobs/` | Spec video. Push file baru di sini = video baru |
| `.github/workflows/render.yml` | Render otomatis di GitHub Actions |

## Menambah tipe video baru

Buat `types/<nama>/index.html` yang mengekspos `window.seek(t)` dan
`window.FILM = { type, width, height, bpm, duration, cues, sections }`, lalu set `"type": "<nama>"` di job.
Renderer dan audio synth tidak perlu diubah.

## Catatan

- Logo dan angka di `jobs/vigenco-launch.json` adalah contoh rekaan. Untuk video sungguhan, pakai angka
  asli dan hanya logo pelanggan yang sudah memberi izin.
- Musik bawaan dibuat dari nol oleh `synth.py`, jadi bebas lisensi. Kalau memakai lagu sendiri lewat
  `audio.music`, pastikan lisensinya mengizinkan penggunaan komersial.
- Teknik motion diadaptasi dari [AbubakrChan/product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) (MIT). Lihat `NOTICE`.
