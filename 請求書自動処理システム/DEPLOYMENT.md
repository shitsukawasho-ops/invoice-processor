# Vercelへのデプロイ手順

## 前提条件
✅ Gitリポジトリの初期化完了
✅ Vercel用設定ファイル（vercel.json）準備完了

## 重要な注意事項

### Vercelの制約
Vercelはサーバーレス環境で実行されるため、以下の制約があります：

⚠️ **Playwrightの制限**: Vercelの標準環境ではPlaywright（ヘッドレスブラウザ）が動作しないため、URLからのPDFダウンロード機能が制限されます。
- `requests`ライブラリでのダウンロードは動作します
- Playwrightが必要な場合は、Render.comまたはGoogle Cloud Functionsをご検討ください

✅ **動作する機能**:
- メール一覧表示
- PDF添付ファイルの検出
- AI解析（OpenAI API）
- requestsによる直接PDF URLダウンロード
- Master Data照合
- Slack通知

## Step 1: GitHubリポジトリの作成

### GitHub Webサイトで作成
1. https://github.com/new にアクセス
2. リポジトリ名: `invoice-processor`（任意）
3. **Public**を選択
4. 「Create repository」をクリック
5. ローカルからpush:

```bash
cd /Users/sitsukawasyo/.gemini/antigravity/playground/giant-crab
git remote add origin https://github.com/YOUR_USERNAME/invoice-processor.git
git branch -M main
git push -u origin main
```

## Step 2: Vercelアカウントの作成

1. https://vercel.com/ にアクセス
2. 「Sign Up」をクリック
3. **GitHubアカウントで登録**（推奨）

## Step 3: プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」を選択
2. GitHubリポジトリを接続
   - 「Import Git Repository」で `invoice-processor` を選択
   - 「Import」をクリック

3. プロジェクト設定:

**Framework Preset**: Other（またはそのまま）

**Build & Output Settings**:
- デフォルトのままでOK（自動検出されます）

**Environment Variables（オプション）**:
APIキーを使用する場合、以下を追加：

- Name: `OPENAI_API_KEY`
  - Value: `sk-proj-...`（あなたのOpenAI APIキー）

- Name: `SLACK_BOT_TOKEN`
  - Value: `xoxb-...`（あなたのSlack Bot Token）

- Name: `SLACK_CHANNEL_ID`
  - Value: `C12345...`（通知先チャンネルID）

4. 「Deploy」をクリック

## Step 4: デプロイ進行状況の確認

- ビルドログが表示されます
- 2-3分程度でデプロイ完了
- 完了すると「Congratulations!」と表示されます

## Step 5: 動作確認

1. Vercelが発行したURLにアクセス（例: `https://invoice-processor.vercel.app`）
2. メール一覧が表示されることを確認
3. **PDF添付済み**のメール（ID: 1）を選択して「Process Invoice」をクリック
4. **URL記載**のメール（ID: 2）も試してみる
   - 直接ダウンロード可能なPDF URLなら成功します
   - ログイン必須のURLはエラーになります（Playwright未対応のため）

## Step 6: 継続的デプロイ

GitHubにpushするたびに、Vercelが自動的に再デプロイします：

```bash
# コード変更後
git add .
git commit -m "Update feature"
git push
```

Vercelが自動的にビルド・デプロイを開始します。

## トラブルシューティング

### デプロイが失敗する場合
- VercelのBuild Logsでエラーメッセージを確認
- requirements.txtの内容を確認

### Playwrightエラーが出る場合
- Vercel環境ではPlaywrightは動作しません
- `mock_emails.json`のID: 2のURLを直接ダウンロード可能なPDFに変更してテスト

### 環境変数が反映されない場合
- Vercelダッシュボード → Settings → Environment Variables で設定
- 再デプロイが必要です（「Redeploy」ボタンをクリック）

## Vercel vs Render.com 比較

| 項目 | Vercel | Render.com |
|------|--------|------------|
| デプロイ速度 | ⚡ 高速（2-3分） | 🐢 普通（5-10分） |
| 起動速度 | ⚡ 即座 | 🐢 初回30秒 |
| Playwright | ❌ 非対応 | ✅ 対応 |
| 無料枠 | ✅ 無制限 | ⌛ 月750時間 |
| 日本人開発者 | 🌟 多い | 🙂 普通 |

## 推奨事項

- **WebUIのテスト・デモ**: Vercel（高速・安定）
- **本番運用（Playwright必要）**: Render.com または Google Cloud Functions

## 次のステップ

デプロイが成功したら：
1. 実際のGmail連携の設定（Gmail API）
2. Google Sheetsへのマスターデータ移行
3. 本番環境での動作確認
