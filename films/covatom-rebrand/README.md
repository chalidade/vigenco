# Saling Jaga → Covatom (film rebrand)

Film vigenco tipe `custom`, portrait 1080×1920, 120 BPM, 18 detik.
Idenya satu dan tidak pernah dipotong: beruang besar yang memeluk beruang kecil berubah jadi dua lingkaran,
dua lingkaran itu jadi dua cincin, lalu di drop cincin kiri membuka dan memeluk cincin kanan.
Itulah ligatur "co" di logotype Covatom. Bagian yang dipakai bersama tetap hijau Saling Jaga sampai drop,
lalu berubah jadi biru Covatom ("Dari pelukan, jadi ikatan.").

## Cara render

Taruh folder ini di `films/covatom-rebrand/` dan dua file job di `jobs/`, lalu dari root repo vigenco:

```bash
node bin/vigenco.mjs snap   jobs/covatom-rebrand.json                 # satu still per beat + sheet.png
node bin/vigenco.mjs render jobs/covatom-rebrand.json --quality draft # cek cepat
node bin/vigenco.mjs render jobs/covatom-rebrand.json --quality high  # final
node bin/vigenco.mjs render jobs/covatom-rebrand-en.json --quality high
```

## Ganti teks

Teks diatur dari file job, tanpa menyentuh kode:

```json
{
  "type": "custom",
  "entry": "films/covatom-rebrand/index.html",
  "format": "vertical",
  "lang": "id",
  "copy": {
    "c1": ["Dari ", "pelukan"],
    "c2": ["jadi ", "ikatan."],
    "fin": ["Saling Jaga", " sekarang bernama ", "Covatom", "."],
    "tagline": "Every node, bonded."
  }
}
```

`lang` bisa `id` atau `en`. `copy` opsional dan menimpa teks bawaan. Bagian kedua dari `c1` dan `c2` adalah kata yang diberi warna.

## Alur (1 beat = 0,5 detik)

| Detik | Yang terjadi |
| --- | --- |
| 0,0 | Logo Saling Jaga sudah ada sejak frame pertama |
| 0,5 | Wordmark "Saling Jaga" masuk |
| 3,0 | Wordmark diganti "Dari pelukan" |
| 4,0 | Dua beruang larut jadi dua lingkaran hijau |
| 5,0 | Lingkaran sama besar dan saling tumpang (Venn) |
| 5,5 | Lingkaran berlubang jadi cincin |
| 6,0 | Malam menyebar dari titik pelukan, cincin jadi putih, bagian bersama tetap hijau |
| 7,0 | Build: dua cincin menahan napas |
| 8,0 | Drop: cincin kiri membuka, bagian bersama jadi biru, "jadi ikatan." |
| 10,0 | Ligatur mengecil ke posisi logotype, huruf v a t o m masuk satu per satu |
| 12,0 | Tagline "Every node, bonded." |
| 14,0 | Wipe biru lalu putih dari titik ikatan, logo versi terang |
| 14,5 | "Saling Jaga sekarang bernama Covatom." |

## Isi folder

- `index.html`, `film.js`: filmnya (`window.seek(t)`, `window.FILM`).
- `logo-data.js`: path logotype Covatom (alternatif B, ligatur "co"), diekspor dari sumber logo. Satuan: radius cincin = 100, titik nol = pusat huruf c.
- `assets/sj-mark.png`, `assets/sj-wordmark.png`: logo dan wordmark Saling Jaga, dipotong dari aset brand yang ada.
- `fonts/`: Outfit 400, 500, 600 (SIL Open Font License), lokal supaya render tidak butuh internet.
