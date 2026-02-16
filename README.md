SiAbsen App - Backend

Panduan Instalasi
Prasyarat:
Node.js (versi terbaru)

1. Setup
  - Buka command prompt di folder selain siabsen lalu jalankan command berikut:

  npm create vue@latest

  NPM akan meminta untuk mengunduh dan memasang create-vue. Ketik "y" kemudian tekan "Enter" untuk mengizinkannya.

  - Create-Vue akan menanyakan serangkaian spesifikasi untuk proyek yang ingin dibuat. Ikuti ketentuan di bawah ini:
    a. Project name: siabsen-app-fe
    b. Select features to include in your project:
      - TypeScript,
      - Router (SPA Development),
      - Pinia (state management),
      - Linter (error management),
      - Prettier (code formatting).
    c. Select experimental features to include in your project: None (klik enter saja).
    d. Skip all example code and start with a blank Vue project? No
    e. Tunggu hingga poses pembuatan kerangka selesai
  
  - Setelah ini, buka folder yang dibuat tersebut lalu copy segala isinya selain .gitignore kepada folder siabsen-app-fe 

  - Jalankan IDE lalu buka folder siabsen-app-fe, lalu buka terminal pada IDE tersebut.

  - Jalankan command ini:

  npm install

  - Setelah selesai, uji coba dengan menjalankan command ini:

  npm run dev

  bila bisa diakses pada link Local yang terlihat di terminal maka setup sudah selesai 

2. Directory Details

src/: Direktori utama untuk kode sumber Vue (komponen, views, assets).

public/: Berisi file statis yang tidak diproses oleh pipeline build.

package.json: Daftar dependensi proyek dan script perintah (build, dev, lint).

vite.config.ts: Konfigurasi untuk tool build Vite.
