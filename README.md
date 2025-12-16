# 📦 E-Package Academic System Interface

E-Package Academic System Interface adalah aplikasi dashboard berbasis web untuk **manajemen paket titipan akademik**.  
Sistem ini dirancang untuk membantu pencatatan, pencarian, dan monitoring status paket secara **terstruktur, real-time, dan mudah digunakan**.

Desain UI mengacu pada Figma berikut:  
🔗 https://www.figma.com/design/dy97P4czX4R4RXoI7SlwXr/E-Packet-Academic-System-Interface

---

## ✨ Fitur Utama

- 📊 **Dashboard Statistik**
  - Total paket
  - Paket sudah diambil & belum diambil
  - Estimasi pemasukan
  - Distribusi paket berdasarkan kategori

- 🔍 **Search Paket (Read-Only)**
  - Pencarian berdasarkan:
    - Nama barang
    - Tanggal
    - Kategori
  - Data real-time dari Supabase
  - Tanpa fitur edit (khusus tampilan user)

- 🗂 **Manajemen Data Paket**
  - Input & update data paket
  - Filter data
  - Pagination

- ⏱ **Recent Activity**
  - Menampilkan paket yang terakhir diinput / diperbarui

---

## 🛠 Teknologi yang Digunakan

- **Frontend**
  - React + TypeScript
  - Vite
  - Tailwind CSS
  - Lucide Icons
  - Recharts

- **Backend / Database**
  - Supabase (PostgreSQL + Realtime)

---

## 📁 Struktur Proyek (Ringkas)

src/
├── app/
│ ├── pages/
│ │ ├── DashboardPaket.tsx
│ │ ├── DataPaket.tsx
│ │ ├── SearchPacket.tsx
│ │ └── InputPaket.tsx
│ ├── components/
│ │ └── DashboardLayout.tsx
│ └── lib/
│ └── supabase.ts
---

## ⚙️ Konfigurasi Supabase

Pastikan file `src/app/lib/supabase.ts` telah terkonfigurasi:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

Tambahkan file .env:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

▶️ Menjalankan Project

Clone repository:

git clone https://github.com/username/e-package.git
cd e-package


Install dependencies:
npm install


Jalankan development server:
npm run dev


Akses aplikasi di:
http://localhost:5173
