# Vigenco

**Spec masuk, MP4 keluar.** Tulis satu file JSON, jalankan GitHub Actions, dan dapatkan video motion
vertikal 60 fps lengkap dengan musik dan efek suara. Tanpa After Effects, tanpa template editor,
tanpa AI video model: setiap frame adalah HTML yang dihitung dari waktu (`seek(t)`).

Tipe video pertama: **`launch`** (video peluncuran produk).

```
jobs/xxx.json ──► types/launch (HTML film, seek(t)) ──► Playwright: N subframe per frame
             ──► ffmpeg tmix (motion blur asli) ──► H.264 60 fps ──► + soundtrack hasil synth ──► out/xxx.mp4
```

## Page: tulis prompt, jadi video

`docs/index.html` adalah aplikasi web (GitHub Pages) untuk membuat video tanpa menulis JSON:
prompt, pilihan **portrait / landscape / square**, lampiran foto atau file (logo, screenshot, PDF),
dan link website atau repo. Setelah **Buat video**:

1. Page meng-commit permintaan ke `requests/<id>/` lalu memicu workflow **Generate video**.
2. **Claude Code** menjadi sutradara dengan salah satu dari dua cara:
   - **Sutradara penuh** (default, 20–40 menit): mengikuti skill product-launch-motion
     (`director/FULL.md` + `director/skill/`). Claude merancang dan menulis film HTML khusus produkmu
     di `films/<id>/`, memeriksanya per beat, lalu menyerahkannya ke renderer. Hasilnya setara dengan
     menjalankan skill itu di terminal.
   - **Cepat** (6–12 menit): mengisi template `launch` (`director/DIRECTOR.md`), lalu
     `bin/validate-job.mjs` merapikannya.
3. Vigenco merender MP4 dan menerbitkannya sebagai GitHub Release `video-<id>`.
4. Page menampilkan progres per langkah, lalu memutar videonya. Semua video muncul di galeri.

### Setup sekali
1. **Secret:** Settings → Secrets and variables → Actions → New repository secret →
   `ANTHROPIC_API_KEY` (dari [Claude Console](https://console.anthropic.com)), atau
   `CLAUDE_CODE_OAUTH_TOKEN` (dari `claude setup-token` dengan langganan Claude Pro/Max).
   Opsional: variable `CLAUDE_MODEL` untuk memilih model.
2. **GitHub Pages:** Settings → Pages → Build and deployment → *Deploy from a branch* →
   `main` / `/docs`. Page tersedia di `https://<user>.github.io/vigenco/`.
3. **Token di page:** buat [fine-grained token](https://github.com/settings/personal-access-tokens/new)
   khusus repo ini dengan izin `Contents` dan `Actions` (Read and write), lalu tempel lewat tombol
   di pojok kanan atas page. Token hanya disimpan di browser itu, tidak pernah di kode.

Catatan: page dan videonya bekerja paling mulus di repo **publik**. Di repo privat, video diunduh lewat
API dengan token sebelum diputar. Lampiran ikut ter-commit ke repo, jadi jangan unggah file rahasia.

## Cara pakai

### Lewat GitHub (tanpa install apa pun)
1. Buat file baru di `jobs/`, misalnya salin `jobs/vigenco-launch.json` lalu ubah isinya.
2. Commit ke `main`. Workflow **Render videos** otomatis merender job yang baru atau berubah.
   Atau buka tab **Actions → Render videos → Run workflow**, pilih file job dan kualitas.
3. Setelah selesai (± 5–10 menit termasuk instalasi), unduh MP4 dari bagian **Artifacts** di halaman run.

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

| Kualitas | Frame rate | Motion blur | Perkiraan waktu render (video 24 detik, mesin 2 core) |
|---|---|---|---|
| `draft` | 30 fps | tidak | ± 1 menit |
| `standard` (default) | 60 fps | 2 subframe | ± 4–6 menit |
| `high` | 60 fps | 4 subframe, PNG lossless | ± 30–40 menit |

Runner GitHub Actions untuk repo publik punya 4 core, jadi biasanya lebih cepat dari angka di atas.

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
| `jobs/` | Spec video. Push file baru di sini = video baru (`jobs/generated/` = hasil dari page) |
| `docs/` | Page "tulis prompt, jadi video" (GitHub Pages) |
| `films/` | Film khusus yang ditulis oleh mode Sutradara penuh, satu folder per permintaan |
| `director/FULL.md`, `director/skill/` | Brief mode Sutradara penuh dan skill product-launch-motion (MIT) |
| `director/DIRECTOR.md` | Brief yang diikuti Claude saat menyutradarai permintaan dari page |
| `bin/direct.mjs`, `bin/validate-job.mjs` | Menjalankan Claude Code headless dan merapikan job yang ditulisnya |
| `.github/workflows/render.yml` | Render otomatis job di `jobs/*.json` |
| `.github/workflows/generate.yml` | Permintaan dari page → Claude → render → GitHub Release |

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
