# 🛒 Hans Store - Toko Online & Logistik

Aplikasi web Single Page Application (SPA) untuk manajemen inventori toko online dengan fitur kalkulasi ongkos kirim otomatis. Dibangun dengan HTML, CSS, dan Vanilla JavaScript murni tanpa framework.

## 📋 Deskripsi Proyek

Proyek ini merupakan tugas Sistem Terdistribusi yang mengintegrasikan **2 layanan API terpisah**:
1. **Inventory Service** - Mengelola katalog produk
2. **Logistics Service** - Menghitung ongkos kirim berdasarkan berat dan tujuan

Aplikasi ini mendemonstrasikan konsep **arsitektur terdistribusi** dengan komunikasi antar-service melalui REST API.

## ✨ Fitur Utama

### 🏪 Storefront (Customer)
- **Katalog Produk** - Tampilan grid card modern dengan informasi lengkap
- **Quantity Selector** - Pilih jumlah barang dengan tombol +/-
- **Cek Ongkir Real-time** - Integrasi langsung dengan Logistics API
- **Kalkulasi Grand Total** - Otomatis menghitung total harga barang + ongkir
- **Multi-destination Support** - Pilih kota tujuan dari dropdown dinamis
- **Checkout / Beli** - Pembelian produk dengan update stok otomatis via PUT API

### ⚙️ Admin Panel
- **Tambah Produk** - Form lengkap untuk menambah stok barang baru
- **Edit Produk** - Update data produk existing dengan PUT API
- **Tabel Daftar Produk** - Lihat semua produk dalam format tabel
- **Auto-generate ID** - ID produk dibuat otomatis dengan timestamp
- **Validasi Input** - Semua field divalidasi sebelum submit
- **Auto-refresh** - Katalog otomatis ter-update setelah penambahan/perubahan produk

### 🎨 UI/UX
- **Responsive Design** - Optimal di desktop, tablet, dan mobile
- **Modern Interface** - Menggunakan Google Fonts (Poppins)
- **Smooth Animations** - Transisi halus dengan CSS
- **Loading States** - Indikator loading untuk setiap operasi async
- **Error Handling** - Pesan error yang user-friendly

## 🛠️ Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Variables, Flexbox, Grid
- **Font**: Google Fonts (Poppins)
- **API**: Fetch API untuk komunikasi REST
- **Arsitektur**: Single Page Application (SPA)

## 🌐 API Integration

### Inventory Service
```
Base URL: https://hans.tugastst.my.id
```

**Endpoints:**
- `GET /products` - Mendapatkan daftar semua produk
- `POST /products` - Menambahkan produk baru
- `PUT /products` - Memperbarui produk existing (update stok, edit data)

**Response Format:**
```json
{
  "data": [
    {
      "id": "PROD-123",
      "name": "Laptop ASUS ROG",
      "category": "Elektronik",
      "price": 15000000,
      "stock": 10,
      "weight_kg": 2.5
    }
  ]
}
```

### Logistics Service
```
Base URL: https://jacob.tugastst.my.id
```

**Endpoints:**
- `GET /tariffs` - Mendapatkan daftar kota dan tarif
- `POST /calculate` - Menghitung ongkos kirim

**Request Body:**
```json
{
  "destination": "Jakarta",
  "weight_kg": 5.0
}
```

**Response Format:**
```json
{
  "total_cost": 50000,
  "eta": "2-3 hari"
}
```

## 📁 Struktur File

```
UAS_Tugas3/
│
├── index.html          # Struktur HTML utama
├── style.css           # Styling dengan CSS Variables
├── script.js           # Logic aplikasi & API integration
└── README.md           # Dokumentasi proyek
```

## 🚀 Cara Menggunakan

### 1. Clone Repository
```bash
git clone https://github.com/<username>/hans-store.git
cd hans-store
```

### 2. Jalankan Aplikasi
Karena ini murni static HTML/CSS/JS, Anda bisa:

**Opsi A: Buka langsung di browser**
```bash
# Buka index.html di browser favorit Anda
```

**Opsi B: Gunakan Live Server (Recommended)**
```bash
# Jika menggunakan VS Code, install extension "Live Server"
# Klik kanan pada index.html -> Open with Live Server
```

**Opsi C: Gunakan Python HTTP Server**
```bash
# Python 3
python -m http.server 8000

# Buka browser: http://localhost:8000
```

### 3. Gunakan Aplikasi

#### Untuk Customer:
1. Buka tab **Katalog**
2. Pilih produk yang ingin dibeli
3. Klik tombol **"Cek Ongkir"**
4. Pilih jumlah barang menggunakan tombol +/-
5. Pilih kota tujuan dari dropdown
6. Klik **"Hitung Ongkir"**
7. Lihat Grand Total (Harga Barang + Ongkir)
8. Klik **"Beli Sekarang"** untuk checkout
9. Konfirmasi pembelian
10. Stok produk akan otomatis berkurang

#### Untuk Admin:
1. Buka tab **Admin**
2. **Tambah Produk Baru:**
   - Isi form dengan data produk:
     - Nama Produk
     - Kategori
     - Harga (Rupiah)
     - Stok
     - Berat (kg)
   - Klik **"Tambah Produk"**
   - Produk baru akan muncul di katalog
3. **Edit Produk:**
   - Lihat tabel daftar produk di bawah form
   - Klik tombol **"Edit"** pada produk yang ingin diubah
   - Form akan terisi dengan data produk
   - Ubah data yang diinginkan
   - Klik **"Simpan Perubahan"**
   - Produk akan ter-update di katalog
Checkout Process
```
1. User pilih quantity dan kota tujuan
2. Hitung grand total
3. Konfirmasi pembelian
4. Frontend kirim PUT request dengan stock baru:
   New Stock = Current Stock - Quantity Bought
5. Backend update database
6. Frontend refresh tampilan
```

### 
## 🎯 Fitur Kalkulasi

### Grand Total Calculation
```
Total Berat = Berat Satuan × Quantity
Total Harga Barang = Harga Satuan × Quantity
Ongkos Kirim = Dihitung dari API berdasarkan Total Berat
Grand Total = Total Harga Barang + Ongkos Kirim
```

### Stock Management
- **Tersedia**: Stok ≥ 10 (badge hijau)
- **Stok Terbatas**: 1 ≤ Stok < 10 (badge kuning)
- **Habis**: Stok = 0 (badge merah, tombol disabled)

## 🎨 Customization

### CSS Variables
Anda bisa mengubah tema warna di `style.css`:

```css
:root {
    --primary-color: #6366f1;      /* Warna utama */
    --primary-dark: #4f46e5;       /* Warna primary gelap */
    --secondary-color: #10b981;    /* Warna sekunder */
    /* ... dan lainnya */
}
```

## 📱 Responsive Breakpoints

- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: ≤ 480px

## 🔧 Development

### Arsitektur Code

**script.js** dibagi menjadi beberapa module:

```javascript
API_CONFIG      // Konfigurasi URL & endpoints
utils           // Fungsi helper (format currency, show/hide)
api             // Fungsi untuk call REST API
ui              // Fungsi untuk update tampilan
handlers        // Event handlers
app             // Main application logic
```

### Code Style
- **Modular**: Code terorganisir dalam object modules
- **Async/Await**: Untuk semua API calls
- **Error Handling**: Try-catch pada semua operasi async
- **ES6+**: Arrow functions, template literals, destructuring

## 🐛 Troubleshooting

**Produk tidak muncul?**
- Pastikan Inventory API (`hans.tugastst.my.id`) bisa diakses
- Cek console browser untuk error message

**Kota tujuan tidak muncul?**
- Pastikan Logistics API (`jacob.tugastst.my.id`) bisa diakses
- Periksa network tab di developer tools

**CORS Error?**
- API harus mengizinkan CORS dari domain Anda
- Jika testing lokal, gunakan browser extension untuk disable CORS (development only)

## 📄 Lisensi

Proyek ini dibuat untuk keperluan tugas kuliah Sistem Terdistribusi.

## 👨‍💻 Author

**Hans** - Tugas 3 Sistem Terdistribusi

## 🙏 Acknowledgments

- Font dari [Google Fonts](https://fonts.google.com/)
- Ikon SVG dari design system standar
- API Partner: Jacob (Logistics Service)

---

⭐ **Jika proyek ini membantu, jangan lupa beri Star!**
