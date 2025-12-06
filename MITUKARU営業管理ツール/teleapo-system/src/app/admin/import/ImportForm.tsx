'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function ImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Import error:', error);
      setResult({ success: 0, failed: 0, errors: ['インポート中にエラーが発生しました'] });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `会社名,担当者名,電話番号,メールアドレス,担当ユーザーID
株式会社サンプル,山田太郎,03-1234-5678,yamada@sample.co.jp,2
有限会社テスト,鈴木花子,03-2345-6789,suzuki@test.co.jp,2`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>CSVファイルをアップロード</h2>

        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'var(--transition)',
            background: file ? 'var(--color-bg)' : 'transparent',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            style={{ display: 'none' }}
          />
          
          {file ? (
            <>
              <FileText size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600 }}>{file.name}</p>
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
                クリックして別のファイルを選択
              </p>
            </>
          ) : (
            <>
              <Upload size={48} style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600 }}>ファイルを選択</p>
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
                CSVファイルをドラッグ&ドロップまたはクリック
              </p>
            </>
          )}
        </div>

        {file && (
          <button
            onClick={handleImport}
            className="btn btn-primary"
            style={{ marginTop: '1.5rem', width: '100%' }}
            disabled={loading}
          >
            <Upload size={16} />
            {loading ? 'インポート中...' : 'インポート開始'}
          </button>
        )}

        {result && (
          <div style={{ marginTop: '1.5rem' }}>
            {result.success > 0 && (
              <div style={{ 
                background: '#d1fae5', 
                color: '#065f46', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={20} />
                {result.success}件のデータを正常にインポートしました
              </div>
            )}
            
            {result.errors.length > 0 && (
              <div style={{ 
                background: '#fee2e2', 
                color: '#991b1b', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={20} />
                  エラーが発生しました
                </div>
                <ul style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{ height: 'fit-content' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>CSVフォーマット</h3>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginBottom: '1rem' }}>
          以下の形式でCSVファイルを作成してください。1行目はヘッダーとして処理されます。
        </p>

        <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontFamily: 'monospace', overflowX: 'auto' }}>
          <div>会社名,担当者名,電話番号,メールアドレス,担当ユーザーID</div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>必須項目</h4>
          <ul style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginLeft: '1rem' }}>
            <li>会社名</li>
            <li>電話番号</li>
          </ul>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>任意項目</h4>
          <ul style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginLeft: '1rem' }}>
            <li>担当者名</li>
            <li>メールアドレス</li>
            <li>担当ユーザーID（空の場合は未割当）</li>
          </ul>
        </div>

        <button 
          onClick={downloadTemplate}
          className="btn btn-outline" 
          style={{ marginTop: '1.5rem', width: '100%' }}
        >
          <Download size={16} />
          テンプレートをダウンロード
        </button>
      </div>
    </div>
  );
}
