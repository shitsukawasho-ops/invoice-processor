# GitHubリポジトリ作成手順

## 現在の状況
- ✅ Gitリポジトリ初期化完了
- ✅ Vercel設定ファイル作成完了
- ⏳ GitHubリポジトリ作成待ち

## 手順

### 方法1: GitHub Webサイト（推奨）

1. **GitHubにログイン**
   - https://github.com/login にアクセス
   - ユーザー名とパスワードを入力

2. **リポジトリ作成**
   - https://github.com/new にアクセス
   - Repository name: `invoice-processor`
   - Description（任意）: `請求書受領・仕訳自動化システム`
   - Public を選択
   - 「Create repository」をクリック

3. **ローカルからpush**
   リポジトリ作成後、以下のコマンドを実行:
   ```bash
   cd /Users/sitsukawasyo/.gemini/antigravity/playground/giant-crab
   git remote add origin https://github.com/YOUR_USERNAME/invoice-processor.git
   git branch -M main
   git push -u origin main
   ```
   
   ※ `YOUR_USERNAME` を実際のGitHubユーザー名に置き換えてください

### 方法2: GitHub CLI

GitHub CLIがインストールされていない場合:
```bash
brew install gh
```

インストール後:
```bash
cd /Users/sitsukawasyo/.gemini/antigravity/playground/giant-crab
gh auth login
gh repo create invoice-processor --public --source=. --remote=origin --push
```

## 完了後

リポジトリURLを教えてください。次にVercelへのデプロイを進めます。
