# Antrian LA

Control Tower antrian muat. **Tampilan 100% di GitHub (Pages), data lewat API Apps Script + Google Sheets.**

**Buka aplikasi:** https://whsfitt10021-lgtm.github.io/Antrian-LA/

```
Browser  ──(halaman statis)──▶  GitHub Pages   (index, security, juru, checker, dashboard)
Browser  ──(fetch JSON)──────▶  Apps Script     (apps-script/Code.gs, jadi API)  ──▶  Google Sheets
```

## Alur & kolom dashboard
Security catat kedatangan (+ jenis kendaraan) → Juru **Mulai muat** (isi No SPM) → **Selesai muat** → Checker **Mulai check** → **Selesai check** → Security **Check out**.

Kolom dashboard (urut): urutan kedatangan, jam kedatangan, no mobil, urutan mulai muat, jam mulai muat, urutan selesai muat, jam selesai muat, no SPM, tujuan, jenis kendaraan, mulai check, selesai check, security check out. Sel urutan mulai muat hijau = sesuai antrean, merah = tidak sesuai.

Kolom baru di tab `TRANSAKSI` (`Jenis_Kendaraan`, `Urut_Finish`, `Jam_Keluar`, `Security_Keluar`) ditambahkan otomatis; data lama aman.

## Struktur
| Path | Isi |
|---|---|
| `index.html` | Gerbang menu + ganti alamat API |
| `security.html` `juru.html` `checker.html` | Halaman per peran |
| `dashboard.html` | Urutan datang vs urutan muat; `?tv=1` untuk mode layar TV |
| `assets/config.js` | **Alamat API** (link `/exec` Apps Script) |
| `assets/lib.js`, `assets/style.css` | Pustaka dan gaya bersama |
| `assets/vendor/` | Preact + htm (lokal, tanpa CDN) |
| `assets/fonts/` | Barlow Condensed (lokal, untuk dashboard TV) |
| `apps-script/Code.gs` | Backend: aturan bisnis + API JSON |
| `apps-script/appsscript.json` | Pengaturan deploy (akses Anyone) |

## Pasang backend (Apps Script)
1. Buat Google Sheet, buka **Extensions > Apps Script**.
2. Tempel isi `apps-script/Code.gs` ke `Code.gs`. (File HTML lama di Apps Script tidak dipakai lagi, boleh dihapus.)
3. Opsional: tampilkan `appsscript.json` di Project Settings lalu samakan isinya.
4. Jalankan menu **Control Tower > Setup tab otomatis**, lalu isi nama petugas di tab `USER`.
5. **Deploy > New deployment > Web app**: Execute as **Me**, Who has access **Anyone**. Salin link `/exec`.
6. Tempel link itu ke `assets/config.js` (atau lewat "Ubah link" di `index.html`, berlaku per browser).

**Penting:** kalau muncul "Tidak bisa terhubung ke server", biasanya link `/exec` belum di-deploy dengan akses **Anyone**. Tes: buka link `/exec` di jendela incognito, harus tampil `{"ok":true,"app":"Antrian LA API"}` (bukan halaman login Google).

Setiap mengubah `Code.gs`: **Deploy > Manage deployments > Edit > New version** agar link `/exec` tetap sama.

## Pasang tampilan (GitHub Pages)
Settings > Pages > Deploy from a branch > `main` / root > Save.

## Keamanan
- Akses **Anyone** berarti siapa pun yang tahu link `/exec` bisa memanggil API. Untuk membatasi, isi baris `API_KEY` di tab `CONFIG` (tambahkan barisnya bila belum ada). Halaman akan meminta kode akses satu kali per browser.
- API hanya menerima fungsi yang didaftarkan (`apiSecurityInit`, `apiSecurityList`, `apiSecurityEntry`, `apiView`, `apiAct`); fungsi lain ditolak.
- Repo publik: jangan simpan kode akses di dalam repo.
