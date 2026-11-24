# Dashboard Laporan Hasil & Kos Penanaman Padi (2020 – 2026)

Sistem analisis interaktif bagi rekod penanaman padi di **Bendang Sungai Baru (11.5 Relong / ~3.3 Hektar)** untuk petani **Pn. Zulfa bt Md Ramli**.

Dibina menggunakan **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts**, **Lucide React**, dan **XLSX**.

---

## 🌾 Ringkasan Keseluruhan (11 Musim)

- **Jumlah Pendapatan Kasar**: RM 291,605.29 (Jualan Padi: RM 224,968.10 | Subsidi SSHP: RM 66,637.19)
- **Jumlah Kos Operasi**: RM 125,024.19
- **Untung Bersih (Selepas Zakat)**: RM 149,921.19 (Purata RM 13,629.20 semusim)
- **Zakat 10% Dilunaskan**: RM 16,657.91
- **Jumlah Hasil Padi**: 149.06 Tan (~2,072 Gundi)
- **Purata Produktiviti**: 1.178 Tan / Relong

---

## 🚀 Ciri-Ciri Utama

1. **📊 Ringkasan Eksekutif**: 6 kad KPI utama dan graf trend perbandingan dwipaksi pendapatan, subsidi, kos, dan untung bersih.
2. **🌾 Analisis Hasil & Tuaian**: Metrik volum berat (Tan), gundi, produktiviti (Tan/Relong), serta analisis perbandingan benih MR297 vs MR330.
3. **💰 Kewangan & Kos**: Pemeriksa kos terperinci mengikut tahun dan musim (2023 - 2026) dengan carta pecahan kategori dan jadual item perbelanjaan.
4. **📄 Resit Timbangan**: Butiran resit lori setiap musim dengan pengiraan peratusan potongan mutu (Basah, Hampa, Hijau, Rosak, Kotor, WB%).
5. **⚖️ Matriks 11 Musim**: Jadual perbandingan prestasi musim-ke-musim dengan keupayaan menyusun (sorting) interaktif.
6. **🧮 Kalkulator Simulasi**: Papan simulasi pulangan musim depan berasaskan slider (luas sawah, hasil tan, harga jualan, kadar subsidi, dan kos).
7. **📤 Muat Naik & Eksport**: Eksport ke CSV, mod mesra cetakan PDF, dan sokongan memuat naik fail lejar Excel baharu secara langsung dalam pelayar.

---

## 🛠️ Pemasangan & Menjalankan Projek

```bash
# Pasang kebergantungan (dependencies)
npm install

# Jalankan dalam mod pembangunan (development)
npm run dev

# Atau bina untuk mod pengeluaran (production)
npm run build
npx next start -p 3005
```

Buka pelayar web di [http://localhost:3000](http://localhost:3000) (atau port 3005).

---

## 📁 Struktur Fail Utama

- `src/app/page.tsx` - Halaman utama papan pemuka dengan navigasi tab
- `src/components/OverviewTab.tsx` - Tab Ringkasan Eksekutif
- `src/components/HarvestTab.tsx` - Tab Analisis Hasil & Varieti Benih
- `src/components/FinancialsTab.tsx` - Tab Kos Terperinci & Zakat
- `src/components/ReceiptsTab.tsx` - Tab Resit Lori & Potongan Mutu
- `src/components/ComparisonTab.tsx` - Tab Matriks Perbandingan 11 Musim
- `src/components/SimulatorTab.tsx` - Tab Kalkulator Simulasi Keuntungan
- `src/components/UploadExcelModal.tsx` - Modal pembaca fail Excel
- `src/data/padiData.json` - Data terstruktur yang diekstrak daripada fail Excel asal
- `HASIL PADI 2023 - 2024 - 2025 (1).xlsx` - Fail Excel data asal
