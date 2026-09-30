# Ide Pengembangan Selanjutnya

## Animasi masuk navbar ala Dynamic Island

Status: direncanakan. Dikerjakan setelah desain splash screen tersedia, supaya
akhir splash dan awal animasi navbar dirancang sebagai satu gerakan.

- Saat kunjungan pertama, monogram RAS muncul sebagai lingkaran kecil dari atas,
  lalu melebar menjadi navbar berbentuk pill yang sudah ada.
- Nama, tautan, dan tombol tema muncul setelah bentuk navbar selesai melebar;
  teks dan ikon tidak ikut diregangkan. Caranya dengan memasang
  `overflow-hidden` hanya selama transisi, teknik yang sama dipakai menu
  hamburger.
- Durasi total sekitar 0,6–0,8 detik. Animasi hanya berjalan sekali pada awal
  kunjungan. `NavBar` berada di `app/(site)/layout.tsx` sehingga tidak ter-mount
  ulang saat pindah halaman; navigasi antarhalaman langsung menampilkan navbar
  tanpa perlu penanda tambahan.
- Bentuk akhir mengikuti tata letak mobile maupun desktop karena lebar tujuannya
  `auto`. Jika pengguna memilih `prefers-reduced-motion`, navbar langsung tampil
  tanpa animasi.
- Navbar sudah `fixed`, jadi halaman tidak mungkin bergeser oleh animasi ini.
  Selama transisi navbar tetap berada di DOM dan dapat difokuskan; yang
  dianimasikan hanya tampilannya.
- Risiko yang perlu diukur: `backdrop-blur` digabung `overflow-hidden` dan
  animasi lebar berpotensi tersendat di GPU lemah. Alternatifnya animasi
  `clip-path`.

## Splash screen pembuka

Status: ide pengembangan selanjutnya, menunggu desain.

### Pemicu

Splash muncul pada dua keadaan saja:

- Kunjungan pertama di browser tersebut.
- Situs tidak dibuka selama 7 hari atau lebih.

Penanda yang disimpan di browser hanya satu timestamp kunjungan terakhir, bukan
data portofolio atau URL gambar bertanda tangan yang masa berlakunya terbatas.
Timestamp ditulis setiap kunjungan, sehingga yang dihitung adalah lamanya situs
tidak dibuka, bukan jarak antar splash. Penulisannya dilakukan setelah splash
selesai, supaya tab yang ditutup di tengah splash tetap terhitung sebagai
kunjungan baru.

### Perilaku

- Splash adalah lapisan di atas konten yang sudah dirender, bukan gerbang yang
  menahan render. Perayap mesin telusur tidak membawa penyimpanan browser antar
  kunjungan sehingga selalu terhitung sebagai pengunjung baru; selama konten
  asli tetap ada di HTML server di bawah lapisan itu, pengindeksan tidak
  terpengaruh.
- Selama splash tampil, lakukan prefetch halaman `/projects` tanpa menunggu
  hasilnya. Prefetch yang gagal atau lambat tidak boleh menahan splash, dan
  kunjungan langsung ke `/projects` tetap harus berfungsi.
- Durasi maksimum tetap. Akhir splash menyalakan animasi masuk navbar supaya
  keduanya terbaca sebagai satu gerakan.
- Hormati `prefers-reduced-motion`.
- Keputusan tampil atau tidak diambil sebelum paint melalui skrip inline kecil,
  sebagaimana next-themes menentukan tema. Menundanya ke efek React akan
  memunculkan kedipan splash.

### Keputusan yang sudah diambil

**Versi konten sebagai pemicu dibatalkan.** Rencana awal membandingkan versi
konten publik sehingga splash muncul lagi setiap kali proyek, timeline, atau
profil berubah. Itu menuntut satu fungsi Postgres, satu pengambilan data
tambahan di layout pada setiap revalidasi, dan membuat pengunjung tetap melihat
splash berulang setiap kali pemilik situs menyunting konten. Pemicu berbasis
waktu memberi hasil yang diinginkan tanpa pekerjaan basis data sama sekali.

**Penanda disimpan di `localStorage`, bukan cookie.** Cookie memungkinkan server
yang memutuskan sehingga tidak ada kedipan sama sekali, tetapi membaca cookie
membuat rute menjadi dinamis dan mematikan `revalidate = 300` pada halaman
publik. Biaya itu terlalu besar untuk sebuah splash.

### Batasan yang diketahui

- Safari membatasi penyimpanan yang ditulis skrip dan dapat menghapus penandanya
  setelah beberapa hari tanpa interaksi. Di sana splash dapat muncul lebih cepat
  dari tujuh hari, dan perilakunya tidak sepenuhnya dapat dikendalikan.
- Ambang dihitung dari jam perangkat pengunjung. Jam yang diubah membuat ambang
  meleset; akibatnya hanya splash yang muncul atau terlewat.
- Mode penyamaran selalu terhitung sebagai kunjungan pertama.
- Splash menunda munculnya konten utama dan ikut terukur oleh Core Web Vitals.
  Dengan pemicu berbasis waktu biaya itu jarang terjadi, tetapi durasinya tetap
  perlu dijaga singkat.
