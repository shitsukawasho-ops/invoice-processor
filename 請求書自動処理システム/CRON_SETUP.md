# Vercel Cron設定ガイド

## 概要
このアプリケーションは10分ごとに自動的にメールをチェックして処理します。

## セットアップ手順

### 1. 環境変数の追加
Vercelダッシュボードで以下の環境変数を追加してください：

**変数名**: `CRON_SECRET`  
**値**: ランダムな文字列（セキュリティ用）  
**例**: `your-secret-key-12345`

#### 追加方法：
1. https://vercel.com/shitsukawasho-ouchiincs-projects/invoice-processor-jnis/settings/environment-variables
2. 「Add New」をクリック
3. Name: `CRON_SECRET`
4. Value: ランダムな文字列を入力
5. Environment: Production, Preview, Development 全て選択
6. 「Save」をクリック

### 2. デプロイ
コードをGitHubにプッシュすると自動的にデプロイされます。

### 3. 動作確認

#### Cronが動作しているか確認：
1. Vercelダッシュボードを開く
2. 「Deployments」→ 最新のデプロイ → 「Functions」タブ
3. `/api/cron/process-emails` の実行ログを確認

#### または、手動でテスト：
```bash
curl -X GET https://invoice-processor-jnis.vercel.app/api/cron/process-emails \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Cronのスケジュール

現在の設定: `*/10 * * * *` = **10分ごと**

### 変更方法：
`vercel.json`の`crons`セクションを編集：

```json
"crons": [
    {
        "path": "/api/cron/process-emails",
        "schedule": "*/5 * * * *"  // 5分ごとに変更
    }
]
```

### スケジュール例：
- `*/5 * * * *` - 5分ごと
- `*/15 * * * *` - 15分ごと
- `0 * * * *` - 毎時0分
- `0 9-17 * * 1-5` - 平日9時〜17時の毎時0分

## トラブルシューティング

### Cronが実行されない場合：
1. ✅ CRON_SECRETが設定されているか確認
2. ✅ Vercel ProプランでCronが有効か確認（無料プランでも一部利用可能）
3. ✅ デプロイが成功しているか確認

### エラーログの確認：
1. Vercelダッシュボード → Deployments
2. 最新のDeployment → Functions タブ
3. `/api/cron/process-emails` のログを確認

## 注意事項
- Vercel無料プランでは月100時間の実行時間制限があります
- 10分ごとの実行なら十分な範囲内です
- エラーが発生した場合はSlackに通知されます
