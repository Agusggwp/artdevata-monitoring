# 🔍 Web Status Monitor

Dashboard monitoring status website/service secara real-time menggunakan Node.js.

## ✨ Fitur

- ✅ Monitoring status website secara real-time
- 📊 Dashboard statistik (total services, online, offline, uptime)
- ⏱️ Menampilkan response time setiap service
- 🔄 Auto-refresh setiap 5 detik
- ⚙️ Konfigurasi services melalui .env file
- 🎨 Tampilan modern dan responsif
- 📱 Mobile-friendly

## 🚀 Cara Menjalankan

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Services

Buat file `.env` atau edit file `.env` yang sudah ada:

```env
# Port server
PORT=3000

# Services yang akan dimonitor (format: Name|URL)
# Pisahkan multiple services dengan koma
SERVICES=Google|https://www.google.com,GitHub|https://www.github.com,Example API|https://jsonplaceholder.typicode.com/posts/1

# Interval pengecekan dalam detik (default: 30)
CHECK_INTERVAL=30
```

**Format Services:** `NamaService|URL,NamaService2|URL2`

Contoh:
```
SERVICES=Google|https://www.google.com,Facebook|https://www.facebook.com,Twitter|https://www.twitter.com
```

### 3. Jalankan Server

```bash
npm start
```

Atau untuk development mode dengan auto-reload:

```bash
npm run dev
```

### 4. Buka Browser

Buka browser dan akses:
```
http://localhost:3000
```

## 📝 Cara Menggunakan

1. **Konfigurasi Services**: Edit file `.env` untuk menambah/menghapus services yang ingin dimonitor
2. **Restart Server**: Setelah mengubah `.env`, restart server untuk apply perubahan
3. **Dashboard** akan otomatis menampilkan status dari services yang dikonfigurasi
4. Status akan di-cek otomatis sesuai interval yang ditentukan di `.env`
5. Dashboard akan refresh otomatis setiap 5 detik

## 🎯 Status Indikator

- 🟢 **Online** - Service berjalan normal
- 🔴 **Offline** - Service tidak dapat diakses
- 🟡 **Degraded** - Service lambat atau ada masalah
- ⚪ **Checking** - Sedang memeriksa status

## 🛠️ Teknologi yang Digunakan

- **Node.js** - Runtime
- **Express.js** - Web framework
- **Axios** - HTTP client untuk cek status
- **node-cron** - Scheduler untuk auto-check
- **dotenv** - Environment configuration
- **HTML/CSS/JavaScript** - Frontend

## 📦 Struktur Proyek

```
monitor/
├── public/
│   ├── index.html      # Halaman utama
│   ├── style.css       # Styling
│   └── app.js          # JavaScript client
├── .env                # Konfigurasi services (tidak di-commit)
├── .env.example        # Contoh konfigurasi
├── server.js           # Server Node.js
├── package.json        # Dependencies
└── README.md           # Dokumentasi
```

## ⚙️ Konfigurasi

### Mengubah Services

Edit file `.env`:

```env
SERVICES=Service1|https://example1.com,Service2|https://example2.com
```

### Mengubah Interval Pengecekan

Edit file `.env`:

```env
CHECK_INTERVAL=60  # Check setiap 60 detik
```

### Mengubah Port Server

Edit file `.env`:

```env
PORT=8080  # Gunakan port 8080
```

## 📄 API Endpoints

- `GET /api/status` - Mendapatkan status semua services

## 🎨 Kustomisasi

Anda dapat mengubah tampilan dengan mengedit:
- **Colors**: Edit gradien di `public/style.css`
- **Services**: Edit file `.env`
- **Interval Check**: Edit `CHECK_INTERVAL` di file `.env`

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.

## 📜 License

ISC License

---

Dibuat dengan ❤️ menggunakan Node.js
# artdevata-monitoring
