import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { parsePadiWorkbook } from '@/lib/parsePadiWorkbook';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DEFAULT_SHEET_ID = '1J4OYRAR1YQ0VrVUgJkxoFJNqVlKYkvEgXURLBsOpYH4';

function extractSheetId(input: string): string {
  if (!input) return DEFAULT_SHEET_ID;
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return input.trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSheet = searchParams.get('sheet') || searchParams.get('url') || DEFAULT_SHEET_ID;
    const sheetId = extractSheetId(rawSheet);

    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    const res = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (NextJS-GoogleSheet-Sync)',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Gagal memuat turun Google Sheet (Status: ${res.status}). Pastikan pautan Google Sheet ditetapkan kepada 'Sesiapa yang mempunyai pautan boleh melihat' (Anyone with the link can view).`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const dataset = parsePadiWorkbook(workbook);

    // Persist to src/data/padiData.json
    try {
      const dataFilePath = path.join(process.cwd(), 'src/data/padiData.json');
      fs.writeFileSync(dataFilePath, JSON.stringify(dataset, null, 2), 'utf8');
    } catch (saveErr) {
      console.warn('Could not persist to padiData.json on disk:', saveErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Google Sheet berjaya dimuat turun dan disegerakkan!',
      sheetId,
      timestamp: new Date().toISOString(),
      dataset
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Ralat semasa menyegerakkan Google Sheet.';
    return NextResponse.json(
      {
        success: false,
        error: errorMsg
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawSheet = body.sheet || body.url || DEFAULT_SHEET_ID;
    const sheetId = extractSheetId(rawSheet);

    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    const res = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (NextJS-GoogleSheet-Sync)',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Gagal memuat turun Google Sheet (Status: ${res.status}). Pastikan perkongsian pautan ditetapkan kepada 'Anyone with the link'.`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const dataset = parsePadiWorkbook(workbook);

    try {
      const dataFilePath = path.join(process.cwd(), 'src/data/padiData.json');
      fs.writeFileSync(dataFilePath, JSON.stringify(dataset, null, 2), 'utf8');
    } catch (saveErr) {
      console.warn('Could not persist to padiData.json on disk:', saveErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Data Google Sheet berjaya disegerakkan sepenuhnya!',
      sheetId,
      timestamp: new Date().toISOString(),
      dataset
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Ralat semasa menyegerakkan Google Sheet.';
    return NextResponse.json(
      {
        success: false,
        error: errorMsg
      },
      { status: 500 }
    );
  }
}
