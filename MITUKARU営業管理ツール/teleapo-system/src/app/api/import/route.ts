import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import pool from '@/utils/db';

// Column name mappings (Japanese to field name)
const COLUMN_MAPPINGS: Record<string, string> = {
  '会社名': 'company_name',
  '住所': 'address',
  '電話番号': 'phone',
  'URL': 'website',
  'ホームページ': 'website',
  'ホームページURL': 'website',
  'メールアドレス': 'email',
  '担当者名': 'contact_name',
  '担当者': 'contact_name',
  '代表者': 'contact_name',
  '担当ユーザーID': 'assigned_to',
  '備考': 'notes',
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({
        success: 0,
        failed: 0,
        errors: ['ファイルにデータがありません']
      });
    }

    // Parse header row to determine column positions
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);

    // Map column positions to field names
    const columnMap: Record<number, string> = {};
    headers.forEach((header, index) => {
      const cleanHeader = header.replace(/^"|"$/g, '').trim();
      const fieldName = COLUMN_MAPPINGS[cleanHeader];
      if (fieldName) {
        columnMap[index] = fieldName;
      }
    });

    // Check if we have required columns
    const hasCompanyName = Object.values(columnMap).includes('company_name');
    const hasPhone = Object.values(columnMap).includes('phone');

    if (!hasCompanyName || !hasPhone) {
      return NextResponse.json({
        success: 0,
        failed: 0,
        errors: ['必須列（会社名、電話番号）が見つかりません。列名を確認してください。']
      });
    }

    // Skip header row
    const dataLines = lines.slice(1);
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // const insert = db.prepare(...); // Prepared statements not used in same way with pg pool

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const columns = parseCSVLine(line);

      // Build row data from column mappings
      const rowData: Record<string, string | null> = {
        company_name: null,
        contact_name: null,
        phone: null,
        email: null,
        address: null,
        website: null,
        notes: null,
        assigned_to: null,
      };

      columns.forEach((value, index) => {
        const fieldName = columnMap[index];
        if (fieldName) {
          // Remove quotes and clean value
          const cleanValue = value.replace(/^"|"$/g, '').trim();
          rowData[fieldName] = cleanValue || null;
        }
      });

      if (!rowData.company_name || !rowData.phone) {
        errors.push(`行${i + 2}: 会社名または電話番号が空です`);
        failed++;
        continue;
      }

      try {
        await pool.query(`
          INSERT INTO customers (company_name, contact_name, phone, email, address, website, notes, assigned_to, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new')
        `, [
          rowData.company_name,
          rowData.contact_name,
          rowData.phone,
          rowData.email,
          rowData.address,
          rowData.website,
          rowData.notes,
          rowData.assigned_to ? parseInt(rowData.assigned_to) : null
        ]);
        success++;
      } catch (err) {
        console.error('Insert error:', err);
        errors.push(`行${i + 2}: データベースエラー`);
        failed++;
      }
    }

    return NextResponse.json({
      success,
      failed,
      errors,
      message: `${success}件のデータをインポートしました。`
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: 0,
      failed: 0,
      errors: ['インポート処理中にエラーが発生しました']
    });
  }
}
