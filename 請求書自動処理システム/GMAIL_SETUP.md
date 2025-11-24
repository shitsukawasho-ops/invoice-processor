# Gmail API設定手順

`billing@ouchi.inc` のメールを読み取るために、Google Cloud Platform (GCP) での設定と認証情報が必要です。

## 手順

### 1. Google Cloud Projectの作成
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 左上のプロジェクト選択プルダウンから「新しいプロジェクト」を作成
   - プロジェクト名: `invoice-processor` (任意)

### 2. Gmail APIの有効化
1. 左メニュー「APIとサービス」→「ライブラリ」
2. "Gmail API" を検索
3. 「有効にする」をクリック

### 3. OAuth同意画面の設定
1. 左メニュー「APIとサービス」→「OAuth同意画面」
2. User Type: **Internal** (組織内のみ) を選択して「作成」
   - ※ Internalが選べない場合は External を選択
3. アプリ情報:
   - アプリ名: `Invoice Processor`
   - ユーザーサポートメール: あなたのメールアドレス
4. 保存して次へ

### 4. 認証情報の作成
1. 左メニュー「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「**OAuth クライアント ID**」
3. アプリケーションの種類: **デスクトップ アプリ**
4. 名前: `Desktop Client` (任意)
5. 「作成」をクリック
6. **JSONをダウンロード**
   - `client_secret_xxxxx.json` というファイルがダウンロードされます
   - これを `credentials.json` にリネームしてください

## 必要なものリスト

本番稼働に向けて、以下の情報・ファイルをご用意ください：

1. **credentials.json** (上記手順で取得)
2. **OpenAI API Key** (`sk-...`)
3. **マスターデータ** (転送ルールのリスト)
   - 現在は `mock_master_data.json` を使用しています。
   - 本番用のドメインと転送先メールアドレスのペアが必要です。
