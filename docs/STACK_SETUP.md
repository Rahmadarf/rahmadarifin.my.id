# Stack setup

Fondasi Next.js App Router, React, TypeScript dan Tailwind CSS sudah aktif. Library tambahan: Supabase JS + SSR, Zod, shadcn/ui, Lucide, next-themes dan Sonner. Motion yang sudah terpasang tetap tersedia.

## Menjalankan proyek

```sh
npm run dev
npm run lint
npm run typecheck
npm run build
```

Gunakan Node.js 24 LTS atau versi yang kompatibel dengan Next.js yang terpasang. Gunakan `npm ci` saat memasang ulang dependensi berdasarkan lockfile.

## Menghubungkan Supabase

1. Buat/pilih proyek Supabase.
2. Salin `.env.example` ke `.env.local`, lalu isi project URL dan publishable key dari menu Connect. Jangan gunakan secret/service_role key untuk variabel publik.
3. Buat akun pemilik melalui Supabase Auth. Matikan pendaftaran publik untuk dashboard satu pemilik.
4. Isi `ADMIN_USER_IDS` dengan UUID akun pemilik dari Supabase Auth. Variabel ini hanya untuk server.
5. Restart `npm run dev` setelah mengubah environment.

Browser menggunakan `lib/supabase/client.ts`. Server Components dan Server Actions menggunakan `lib/supabase/server.ts`. `proxy.ts` memperbarui sesi untuk jalur `/admin` dan `/auth`; ini bukan pengganti otorisasi. Sebelum membaca atau mengubah data admin, panggil `requireAdmin()` dari `lib/auth/admin.ts`.

Helper admin memverifikasi user melalui Auth dan membandingkan UUID dengan daftar pemilik. Nilai role dari user_metadata tidak digunakan. Ketika daftar pemilik kosong, akses admin ditolak.

Proyek tetap dapat dibuild sebelum konfigurasi Supabase diisi. Helper Supabase menampilkan pesan konfigurasi saat dipanggil tanpa environment.

## UI dan validasi

Komponen shadcn berada di `components/ui`; `cn()` di `lib/utils.ts`. `Providers` memasang tema berbasis class dan notifikasi. Gunakan `useTheme()` untuk tombol tema; gunakan `toast()` dari Sonner untuk notifikasi. Validasi input di server menggunakan Zod, termasuk ketika form sudah melakukan validasi di browser.

Token UI memakai putih, netral, aksen biru, radius, serta font Inter/Fira Code sesuai prototipe. Tema gelap memakai `.dark`. Font diunduh melalui `next/font` saat build dan disajikan dari aplikasi.

## Tahap berikutnya

Konversi halaman portofolio dan admin ke komponen React, buat struktur database serta migration/RLS, atur bucket dan izin Storage, lalu implementasikan login dan CRUD. Database dan akses Storage harus membatasi perubahan pada UUID pemilik dan hanya memberikan pembacaan publik untuk konten published. Daftar ADMIN_USER_IDS di server tidak otomatis membuat kebijakan database.

Setup ini belum membuat tabel, bucket, halaman login, atau akun Supabase. Autentikasi, koneksi database, serta upload live diuji setelah konfigurasi proyek tersedia. Vercel dapat mengimpor repository ini; tambahkan environment yang sama saat deploy.

Referensi: https://supabase.com/docs/guides/auth/server-side/creating-a-client · https://ui.shadcn.com/docs/installation/next
