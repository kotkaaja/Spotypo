# Spotypo - Klon Tampilan Antarmuka Spotify

Spotypo adalah proyek *front-end* yang dibuat untuk mereplikasi tampilan dan nuansa antarmuka pengguna (UI) dari aplikasi desktop Spotify. Proyek ini dibangun dengan **HTML**, **CSS**, dan **JavaScript** murni, dengan bantuan *framework* **Tailwind CSS** untuk *styling* yang cepat dan responsif.

![Screenshot Proyek Spotypo](https://od.lk/s/ODVfNzI1NDI2MDVf/ss.png)

---

## 🎵 Fitur Utama

-   **Tampilan Familiar**: Desain yang sangat mirip dengan aplikasi Spotify, termasuk *layout*, skema warna, dan ikonografi.
-   **Pemutar Musik Fungsional**: Kontrol pemutar musik di bagian *footer* yang dapat memutar, menjeda, mengganti lagu, serta mengatur volume dan *progress bar*.
-   **Daftar Lagu Dinamis**: Kartu-kartu lagu dimuat secara dinamis dari sebuah "database" JavaScript sederhana.
-   **Pencarian Lagu**: Fitur pencarian *real-time* untuk mencari lagu atau artis.
-   **Manajemen Playlist**: Pengguna dapat membuat playlist baru dan menambahkan lagu ke dalamnya melalui antarmuka modal.
-   **Sidebar Interaktif**: Menampilkan informasi artis saat sebuah lagu dipilih.

---

## 🚀 Teknologi yang Digunakan

-   **HTML5**: Untuk struktur dasar halaman web.
-   **CSS3**: Untuk *styling* kustom, animasi, dan *layout* grid.
-   **[Tailwind CSS](https.tailwindcss.com/)**: Sebagai *framework* CSS utama untuk membangun desain dengan cepat (digunakan via CDN).
-   **JavaScript (ES6+)**: Untuk semua logika fungsional, manipulasi DOM, dan interaktivitas.
-   **[Font Awesome](https://fontawesome.com/)**: Untuk ikon-ikon yang digunakan di seluruh aplikasi.
-   **[Google Fonts](https://fonts.google.com/)**: Untuk tipografi.

---

## ⚙️ Instalasi dan Cara Menjalankan

Proyek ini tidak memerlukan *build step* yang rumit karena menggunakan CDN Tailwind CSS untuk pengembangan.

1.  **Kloning Repositori**
    Salin repositori ini ke mesin lokal Anda menggunakan `git`:
    ```bash
    git clone https://github.com/kotkaaja/Spotypo.git
    ```

2.  **Buka Direktori Proyek**
    ```bash
    cd Spotypo
    ```

3.  **Jalankan di Browser**
    Buka file `index.html` langsung di browser pilihan Anda (misalnya Chrome, Firefox, atau Edge).

    Untuk pengalaman terbaik dan menghindari masalah terkait CORS, disarankan untuk menjalankannya menggunakan *server* lokal. Jika Anda menggunakan Visual Studio Code, Anda bisa menginstal ekstensi **[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)** dan klik "Go Live" di pojok kanan bawah editor Anda.
