# 請求書受領・仕訳自動化システム

メールアドレス（`billing@ouchi.inc`）で受領した請求書を解析し、Money Forwardへの転送、またはSlackへの通知を自動化するシステムです。

## 機能

### Phase 1: メール受信・PDF検出
- メールからPDF添付ファイルを自動検出

### Phase 2: AI解析・PDFダウンロード
- OpenAI APIでメール本文を解析
- 請求書URLを自動抽出
- PDFを自動ダウンロード（requests → Playwright）

### Phase 3: マスターデータ照合・転送
- 送信元ドメインでマスターデータを照合
- Money Forward宛にメール転送

### Phase 4: 例外処理
- ダウンロード失敗、URL未検出、マスター未登録時にSlack通知

## ローカル環境での実行

### 1. 依存関係のインストール
```bash
pip install -r requirements.txt
python -m playwright install chromium
```

### 2. 環境変数の設定（オプション）
`.env` ファイルを作成：
```
OPENAI_API_KEY=your_openai_api_key
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_CHANNEL_ID=your_channel_id
```

### 3. WebUIの起動
```bash
python app.py
```

ブラウザで `http://127.0.0.1:5000` にアクセス

## デプロイ

### Vercelへのデプロイ（推奨）

詳細は [`DEPLOYMENT.md`](DEPLOYMENT.md) を参照してください。

**簡易手順:**
1. GitHubリポジトリを作成
2. https://vercel.com/ にアクセス
3. GitHubと連携してプロジェクトをインポート
4. 「Deploy」をクリック

**注意**: Vercelではヘッドレスブラウザ（Playwright）が動作しないため、直接ダウンロード可能なPDF URLのみ対応します。Playwrightが必要な場合はRender.comを推奨。

### その他のデプロイ先
- **Render.com**: Playwright対応（無料枠あり）
- **Google Cloud Functions**: Gmail連携が容易
- **AWS Lambda**: スケーラブル

## アーキテクチャ

```
├── app.py                 # Flask Webアプリケーションのエントリーポイント
├── main.py                # CLI版のエントリーポイント
├── config.py              # 環境変数の管理
├── services/
│   ├── email_service.py      # メール送受信
│   ├── ai_service.py          # OpenAI API連携
│   ├── browser_service.py     # PDF ダウンロード
│   ├── master_data_service.py # マスターデータ照合
│   └── notification_service.py # Slack通知
├── templates/
│   └── index.html         # WebUI
├── mock_emails.json       # テスト用モックデータ
└── mock_master_data.json  # テスト用マスターデータ
```

## ライセンス
MIT
