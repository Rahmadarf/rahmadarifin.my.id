# Ide Pengembangan Selanjutnya

## Animasi masuk navbar ala Dynamic Island

Status: direncanakan, belum diimplementasikan.

- Saat kunjungan pertama, monogram RAS muncul sebagai lingkaran kecil dari atas, lalu melebar menjadi navbar berbentuk pill yang sudah ada.
- Nama, tautan, dan tombol tema muncul setelah bentuk navbar selesai melebar; teks dan ikon tidak ikut diregangkan.
- Durasi total sekitar 0,6–0,8 detik. Animasi hanya berjalan sekali pada awal kunjungan; navigasi antarhalaman langsung menampilkan navbar.
- Bentuk akhir mengikuti tata letak mobile maupun desktop. Jika pengguna memilih `prefers-reduced-motion`, navbar langsung tampil tanpa animasi.
- Pertahankan posisi navbar agar halaman tidak bergeser dan navigasi tetap dapat diakses selama transisi.

## Splash screen pembuka dan penyegaran konten

Status: ide pengembangan selanjutnya, belum diimplementasikan.

- Tampilkan splash screen singkat saat seseorang pertama kali membuka situs di browser tersebut. Setelah konten publik berubah, tampilkan lagi pada kunjungan berikutnya.
- Gunakan versi konten publik yang meningkat saat proyek, timeline, profil, atau konten terbit lain berubah. Bandingkan versi server dengan versi yang tersimpan di browser; perubahan draft tidak memicu splash.
- Selama splash tampil, lakukan prefetch halaman `/projects` agar navigasi berikutnya lebih cepat. Pertahankan render server dan revalidasi halaman untuk memastikan data tetap segar; prefetch tidak menjamin setiap kunjungan bebas pemuatan.
- Jangan menahan halaman sampai seluruh detail proyek dan gambar selesai diunduh. Kunjungan langsung ke `/projects` tetap harus berfungsi, dan kegagalan prefetch tidak boleh membuat splash tertahan.
- Simpan penanda versi di browser, bukan seluruh data portofolio atau URL gambar bertanda tangan yang masa berlakunya terbatas.
- Jika pembaruan terjadi saat pengunjung sedang membaca, segarkan konten tanpa memunculkan splash mendadak. Selaraskan akhir splash dengan animasi masuk navbar dan hormati `prefers-reduced-motion`.
