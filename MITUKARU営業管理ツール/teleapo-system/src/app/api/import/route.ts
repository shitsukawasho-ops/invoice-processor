import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

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

    // Skip header row
    const dataLines = lines.slice(1);
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    const insert = db.prepare(`
      INSERT INTO customers (company_name, contact_name, phone, email, assigned_to, status)
      VALUES (?, ?, ?, ?, ?, 'new')
    `);

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const columns = line.split(',').map(col => col.trim());
      
      if (columns.length < 2) {
        errors.push(`行${i + 2}: 必須項目が不足しています`);
        failed++;
        continue;
      }

      const [companyName, contactName, phone, email, assignedTo] = columns;

      if (!companyName || !phone) {
        errors.push(`行${i + 2}: 会社名または電話番号が空です`);
        failed++;
        continue;
      }

      try {
        insert.run(
          companyName,
          contactName || null,
          phone,
          email || null,
          assignedTo ? parseInt(assignedTo) : null
        );
        success++;
      } catch (err) {
        errors.push(`行${i + 2}: データベースエラー`);
        failed++;
      }
    }

    return NextResponse.json({ success, failed, errors });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: 0, 
      failed: 0, 
      errors: ['インポート処理中にエラーが発生しました'] 
    });
  }
}
