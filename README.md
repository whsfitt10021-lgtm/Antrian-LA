# Antrian LA

**Buka aplikasi:** https://whsfitt10021-lgtm.github.io/Antrian-LA/

Control Tower antrian muat (Google Apps Script + Preact).

## Isi
- `Code.gs` : server (config, alur status, REKAP, API web app)
- `Style.html`, `Lib.html` : gaya dan pustaka bersama
- `Security.html`, `Juru.html`, `Checker.html`, `Dashboard.html` : satu halaman per peran

## Pasang
1. Di Apps Script, tempel `Code.gs`, lalu buat 5 file HTML dengan nama persis seperti di atas.
2. Jalankan menu Control Tower > Setup tab otomatis, lalu Perbarui REKAP.
3. Deploy sebagai Web app. Halaman: `?page=security|juru|checker|dashboard`.
4. TV: `?page=dashboard&tv=1`.

## Halaman github.io
Alamat: https://whsfitt10021-lgtm.github.io/Antrian-LA/

`index.html` adalah gerbang menuju tiap halaman. Aktifkan di GitHub: Settings > Pages > Deploy from a branch > `main` / root.
Buka halamannya, tempel link web app Apps Script (`.../exec`) satu kali; link diingat di browser.
