

# FBB House Keeping & Performance Dashboard

Website ini adalah dashboard interaktif untuk memantau dan mengelola data House Keeping (HK) serta performa operasional pada lingkungan FBB (Fixed Broadband). Terdapat dua halaman utama:

- **Dashboard (index.html):**
  - Menampilkan visualisasi performa, tren, dan hasil House Keeping dalam bentuk grafik dan tabel.
  - Fitur filter berdasarkan cabang, tanggal, dan parameter lain.
  - Desain responsif dan modern, memanfaatkan TailwindCSS serta berbagai library UI.

- **Tool House Keeping (hk.html):**
  - Menyediakan alat pelacakan dan pengelolaan data fallout House Keeping.
  - Fitur filter lanjutan (branch, WOK, STO, status HK, tanggal, dsb).
  - Tabel interaktif dan pagination untuk kemudahan navigasi data.

## Fitur Utama
- Visualisasi data dengan Chart.js
- Tabel interaktif dan filter dinamis
- Desain responsif (mobile & desktop)
- Integrasi API untuk data real-time
- Navigasi sidebar dan mobile menu

## Struktur Utama
- `index.html` — Dashboard utama
- `hk.html` — Tool House Keeping
- `css/` — File CSS utama dan tema
- `js/` — Script utama aplikasi
- `vendor/` — Library eksternal (Chart.js, Bootstrap, FontAwesome, dsb)
- `images/icon/logo.png` — Logo aplikasi
- `api/realtime.js` — Endpoint data real-time

## Cara Menjalankan
Cukup buka `index.html` atau `hk.html` di browser. Tidak memerlukan backend khusus kecuali untuk endpoint API tertentu.

---

> Website ini dikembangkan untuk kebutuhan monitoring dan pengelolaan House Keeping FBB secara efisien dan informatif.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/solutions/html&project-name=html)
