# Database, RLS, dan Storage

Semua SQL ada di `supabase/migrations/` dan dijalankan berurutan:

| File | Isi |
| --- | --- |
| `20260929120000_portfolio_schema.sql` | Enum, tabel, trigger, index, dan grant. |
| `20260929120100_portfolio_rls.sql` | `enable row level security` plus policy per tabel. |
| `20260929120200_portfolio_storage.sql` | Bucket `portfolio-media`, helper `is_published_media()`, dan policy Storage. |
| `20260929120300_revoke_anon_writes.sql` | Cabut privilege tulis `anon` yang datang dari default privileges Supabase. |
| `supabase/seed.sql` | Konten dari desain HTML. Opsional. |

## Menjalankan migration

Belum ada Supabase CLI di mesin ini, jadi pilih salah satu:

**A. Dashboard SQL Editor.** Buka project di Supabase, lalu jalankan isi setiap file migration dalam urutan di atas. Setelah itu jalankan `supabase/seed.sql` bila ingin konten awal — ganti dulu `v_owner` di baris pertama blok `do $$` dengan UUID akun Anda.

**B. Supabase CLI.** Setelah `supabase link --project-ref <ref>`:

```bash
supabase db push
```

Seed ikut berjalan pada `supabase db reset` (lokal), bukan pada `db push`.

## Tabel

Satu baris `profile` per pemilik, sisanya banyak baris per pemilik.

| Tabel | Dipakai oleh |
| --- | --- |
| `profile` | Hero, About, Contact, footer note |
| `projects` | Featured Projects, `/projects`, `/projects/[slug]` |
| `timeline_entries` | Activities & Seminars |
| `skills` | Skills, termasuk hitungan tab |
| `social_links` | Ikon sosial di Hero dan Contact |

Catatan model data:

- `owner_id uuid` mengacu ke `auth.users(id)` dengan `on delete cascade`. Kolom ini satu-satunya dasar otorisasi di database.
- `status` bertipe enum `content_status` (`draft` / `published`). Trigger `sync_published_at` mengisi dan mengosongkan `published_at` mengikuti status.
- Primary key memakai `bigint generated always as identity`. URL publik memakai `slug`, bukan id.
- `skills.category` adalah kategori eksklusif; `skills.is_core` yang mengisi tab **Main**. Karena Main memotong semua kategori, jumlah per tab memang tidak berjumlah sama dengan total — sama seperti prototipe (All 16, Main 5).
- `projects.features` adalah `text[]` (satu poin per baris di form), dan `note_label` / `note_body` mengisi satu kartu samping di halaman detail.

## RLS

Setiap tabel punya lima policy dengan pola yang sama:

| Policy | Role | Aturan |
| --- | --- | --- |
| `*_select_published` | `anon`, `authenticated` | `status = 'published'` |
| `*_select_own` | `authenticated` | `(select auth.uid()) = owner_id` |
| `*_insert_own` | `authenticated` | `with check` owner |
| `*_update_own` | `authenticated` | `using` **dan** `with check` owner |
| `*_delete_own` | `authenticated` | `using` owner |

Beberapa hal yang disengaja:

- `UPDATE` memakai `using` dan `with check` sekaligus. Tanpa `with check`, baris bisa dipindah ke `owner_id` orang lain.
- Dua policy `SELECT` digabung dengan OR oleh Postgres: publik melihat baris published, pemilik juga melihat draft miliknya sendiri.
- `auth.uid()` dibungkus subquery (`(select auth.uid())`) supaya dievaluasi sekali per statement, bukan per baris.
- Policy memakai klausa `TO`, bukan `auth.role()`.
- Supabase punya default privileges yang memberi `anon` semua privilege pada tabel baru di schema `public`. RLS memang sudah menahan tulisan anonim — diuji di project live, UPDATE dan DELETE anonim mengenai nol baris — tapi privilege tabelnya tetap ada. Migration `20260929120300` mencabutnya supaya ada dua lapis, bukan hanya satu policy.

**`ADMIN_USER_IDS` tidak membuat kebijakan database.** Variabel itu hanya dibaca `requireAdmin()` di server Next.js. Menambah UUID di sana tidak memberi hak apa pun atas baris milik orang lain, dan menghapus UUID dari sana tidak mencabut akses database — cabut lewat Supabase Auth (nonaktifkan atau hapus user). Dua lapis ini independen: aplikasi menolak sesi non-pemilik, database menolak tulisan lintas pemilik.

## Storage

Bucket `portfolio-media` bersifat **private** (`public = false`), dibatasi 5 MB per objek dan MIME `image/png`, `image/jpeg`, `image/webp`, `image/avif`.

Bucket publik akan membuka semua objek bagi siapa pun yang punya URL, termasuk thumbnail proyek draft. Itu lebih luas dari "pembacaan publik hanya untuk konten published", jadi aksesnya diatur lewat policy dan aplikasi memakai signed URL berumur 1 jam (`lib/media/sign.ts`).

Path objek selalu `<uuid pemilik>/<kind>/<file>`, karena policy tulis membaca segmen pertama sebagai klaim kepemilikan.

| Policy | Role | Aturan |
| --- | --- | --- |
| `portfolio_media_read_published` | `anon`, `authenticated` | `public.is_published_media(name)` |
| `portfolio_media_owner_read` | `authenticated` | segmen pertama path = `auth.uid()` |
| `portfolio_media_owner_insert` | `authenticated` | idem |
| `portfolio_media_owner_update` | `authenticated` | idem, `using` + `with check` |
| `portfolio_media_owner_delete` | `authenticated` | idem |

`is_published_media()` bersifat `SECURITY INVOKER` dan `stable`, jadi RLS pada `public.projects` dan `public.profile` tetap berlaku di dalamnya. Objek berhenti terbaca publik begitu baris yang mengacu padanya kembali ke draft atau dihapus.

Upsert Storage butuh `insert` + `select` + `update`; ketiganya ada dan semuanya owner-scoped.

## Alur upload

Upload berjalan dari browser ke Storage (`components/admin/media-upload.tsx`), lalu form hanya mengirim path objeknya. Ini menjauhkan file dari body Server Action sekaligus tetap melewati policy Storage. Server Action memeriksa ulang bahwa path diawali UUID pemilik sebelum menyimpannya ke baris konten.

Karena upload terjadi sebelum form disimpan, sebuah file bisa masuk bucket tanpa pernah menempel di baris. Empat hal menanganinya:

1. **Ganti atau hapus upload yang belum tersimpan** — langsung dihapus dari browser. Komponen membandingkan path yang dibuangnya dengan `initialPath`, yaitu path yang sedang dipegang baris. Jadi gambar yang sudah tersimpan tidak pernah ikut terhapus di sini.
2. **Gambar tersimpan yang tergantikan** — dihapus Server Action setelah penyimpanan berhasil, bukan sebelumnya, supaya membatalkan form tidak menghilangkan gambar lama.
3. **Sweep otomatis** (`lib/media/sweep.ts`) — jalan setelah setiap penyimpanan proyek/profil dan setelah proyek dihapus. Sweep membuang objek di folder pemilik yang tidak dirujuk baris mana pun, termasuk baris draft.
4. **Tombol manual** di tab Profile — untuk kasus yang tidak terjangkau sweep otomatis: upload yang ditinggalkan di panel yang tidak akan disimpan lagi.

Dua pengaman di dalam sweep:

- Setiap path yang dirujuk salah satu baris pemilik dilewati. Kalau query rujukan itu gagal, sweep berhenti tanpa menghapus apa pun — error tidak boleh dibaca sebagai "tidak ada yang dirujuk".
- Objek yang lebih baru dari 60 menit dilewati, karena tab lain mungkin baru mengunggahnya dan belum menyimpan.

Sweep memakai sesi pemilik, jadi policy Storage tetap mengurungnya di folder pemilik sendiri meskipun prefix-nya salah. Kegagalan sweep tidak pernah menggagalkan penyimpanan.

Sisa celah yang diketahui: navigasi antar halaman di dalam aplikasi tidak memicu konfirmasi "belum tersimpan" — `beforeunload` hanya menangkap reload dan penutupan tab. Upload yang ditinggalkan lewat jalur itu dibersihkan oleh sweep, bukan dicegah.
