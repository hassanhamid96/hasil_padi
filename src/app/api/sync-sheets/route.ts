import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { parsePadiWorkbook } from '@/lib/parsePadiWorkbook';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Rahsia ID Google Sheet diuruskan sepenuhnya di sebelah pelayan (Server-Side)
const SERVER_SHEET_ID = process.env.GOOGLE_SHEET_ID || '1J4OYRAR1YQ0VrVUgJkxoFJNqVlKYkvEgXURLBsOpYH4';

export async function POST() {
  try {
    if (!SERVER_SHEET_ID) {
      throw new Error('Konfigurasi pelayan Google Sheet tidak ditemui.');
    }

    // Sambungan pelayan ke Google Sheets tanpa mendedahkan URL kepada klien
    const exportUrl = `https://docs.google.com/spreadsheets/d/${SERVER_SHEET_ID}/export?format=xlsx`;
    const res = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Secure-Server-Sync)',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Pelayan gagal memuat turun data daripada Google Sheets.');
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const dataset = parsePadiWorkbook(workbook);

    // Simpan salinan tempatan pada pelayan untuk akses luar talian
    try {
      const dataFilePath = path.join(process.cwd(), 'src/data/padiData.json');
      fs.writeFileSync(dataFilePath, JSON.stringify(dataset, null, 2), 'utf8');
    } catch (saveErr) {
      console.warn('Could not persist to padiData.json on disk:', saveErr);
    }

    // Pulangkan data bersih tanpa mendedahkan sebarang maklumat sheetId atau pautan kepada klien
    return NextResponse.json({
      success: true,
      message: 'Data lejar berjaya dikemas kini secara selamat daripada pelayan.',
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dataset
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Ralat semasa menyegerakkan data.';
    return NextResponse.json(
      {
        success: false,
        error: errorMsg
      },
      { status: 500 }
    );
  }
}
