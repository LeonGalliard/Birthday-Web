<<<<<<< HEAD
# 📖 Memory Book: The Last Letter

Website ulang tahun sinematik berbasis Flask — sebuah buku kenangan digital yang secara perlahan mengungkap sebuah surat panjang.

---

## Struktur Folder

```
memory-book/
├── app.py                  ← Flask app utama
├── requirements.txt        ← Dependencies Python
├── Procfile                ← Untuk deploy Render
├── .gitignore
│
├── data/                   ← ⚙️ FILE KONFIGURASI KONTEN
│   ├── letter.json         ← Isi surat (edit di sini)
│   ├── timeline.json       ← Timeline satu tahun
│   └── photos.json         ← Daftar foto + caption
│
├── static/
│   ├── css/
│   │   └── style.css       ← Semua styling
│   ├── js/
│   │   └── main.js         ← Semua logika JS
│   └── images/             ← Letakkan foto di sini
│       ├── photo1.jpg
│       ├── photo2.jpg
│       └── ...
│
└── templates/
    └── index.html          ← Template HTML utama
```

---

## Cara Kustomisasi

### 1. Ganti Nama Penerima
Buka `app.py`, ubah bagian CONFIG:
```python
CONFIG = {
    "recipient_name": "Nama Kamu",   # ← ganti di sini
    "sender_name":    "Dari Siapa",
    "birthday_date":  "7 Juni",
}
```

### 2. Edit Isi Surat
Buka `data/letter.json`:
```json
{
  "paragraphs": [
    "Paragraf pertama surat...",
    "Paragraf kedua..."
  ]
}
```

### 3. Edit Timeline
Buka `data/timeline.json` — setiap item memiliki:
- `month`: Nama bulan
- `title`: Judul momen
- `text`: Deskripsi singkat

### 4. Ganti Foto
1. Letakkan file foto di `static/images/`
2. Edit `data/photos.json`:
```json
[
  {
    "src": "/static/images/foto1.jpg",
    "placeholder": "/static/images/foto1.jpg",
    "caption": "Judul foto",
    "note": "Catatan kecil"
  }
]
```
> **Tip:** Field `placeholder` digunakan jika foto tidak ditemukan. Bisa diisi URL eksternal sebagai fallback.

---

## Cara Menjalankan Lokal

```bash
# 1. Buat virtual environment
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Jalankan
python app.py

# 4. Buka browser
# http://localhost:5000
```

---

## Deploy ke Render (Gratis)

### Langkah 1: Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit - Memory Book"
git remote add origin https://github.com/username/memory-book.git
git push -u origin main
```

### Langkah 2: Buat Web Service di Render
1. Buka **https://render.com** → Login / Daftar
2. Klik **"New +"** → **"Web Service"**
3. Pilih repository GitHub kamu
4. Isi pengaturan:
   - **Name**: `memory-book` (atau nama lain)
   - **Region**: Singapore (paling dekat Indonesia)
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free
5. Klik **"Create Web Service"**

### Langkah 3: Tunggu Deploy
Render akan otomatis build dan deploy. Setelah selesai kamu dapat URL publik seperti:
`https://memory-book-xxxx.onrender.com`

### ⚠️ Catatan Render Free Plan
- Server akan "tidur" setelah 15 menit tidak ada traffic
- Loading pertama bisa lambat ~30 detik (cold start)
- Untuk produksi, pertimbangkan upgrade ke Starter plan

---

## Teknologi

| Layer    | Teknologi |
|----------|-----------|
| Backend  | Flask 3.x + Python |
| Deploy   | Gunicorn + Render |
| Font     | Cormorant Garamond, DM Sans, Dancing Script |
| Animasi  | GSAP 3, AOS, CSS Animations |
| Typing   | Typed.js |
| Confetti | canvas-confetti |
| Icons    | Font Awesome 6 |
| Stars    | Canvas API (custom) |
| Music    | Web Audio API (generated, no file needed) |

---

## Lisensi
Dibuat dengan ❤️ — bebas digunakan untuk keperluan personal.
=======
# Birthday-Web
>>>>>>> 6b1887a8b1d6f59d58d184a07f000845c0e117ec
