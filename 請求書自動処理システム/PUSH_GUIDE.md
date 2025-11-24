# GitHubへコードをアップロードする詳細手順

## 現在の状況
- ✅ GitHubリポジトリ作成済み: https://github.com/shitsukawasho-ops/invoice-processor
- ⏳ コードをGitHubにアップロード中（これから実施）

## 手順1: ターミナルを開く

Macの場合：
1. **Spotlight検索を開く**
   - キーボードで `Command (⌘) + Space` を押す
   
2. **「ターミナル」と入力**
   - 検索ボックスに「ターミナル」と入力
   
3. **Enterキーを押す**
   - ターミナルアプリが起動します

## 手順2: プロジェクトフォルダに移動

ターミナルに以下のコマンドをコピー&ペーストして、Enterキーを押してください：

```bash
cd /Users/sitsukawasyo/.gemini/antigravity/playground/giant-crab
```

**確認:** プロンプトが以下のように変わればOKです：
```
.../giant-crab %
```

## 手順3: GitHubへのアクセス権を設定

### 方法A: GitHub Personal Access Token（推奨）

#### 3-1. トークンを生成

1. **ブラウザで以下のURLを開く**
   ```
   https://github.com/settings/tokens
   ```

2. **「Generate new token」をクリック**
   - 「Generate new token (classic)」を選択

3. **設定を入力**
   - **Note**: `Vercel Deploy Token` と入力（任意の名前でOK）
   - **Expiration**: `90 days`（90日間有効）
   - **Select scopes**: ✅ `repo` にチェックを入れる（一番上のチェックボックス）

4. **「Generate token」をクリック**
   - 緑色のボタンをクリック

5. **トークンをコピー**
   - `ghp_xxxxxxxxxxxxx` のような文字列が表示されます
   - 右側のコピーアイコンをクリックしてコピー
   - ⚠️ **このページを閉じると二度と表示されないので注意！**
   - メモ帳などに一時的に保存しておくと安全です

#### 3-2. GitHubにコードをプッシュ

ターミナルに戻り、以下のコマンドを入力してEnterキーを押してください：

```bash
git push origin main
```

**すると以下のような入力を求められます：**

```
Username for 'https://github.com': 
```

**ここで以下を入力：**

1. **Username**: あなたのGitHubユーザー名を入力してEnter
   - 例: `shitsukawasho-ops`

2. **Password**: 先ほどコピーしたトークンを貼り付けてEnter
   - `ghp_xxxxxxxxxxxxx` のような文字列
   - ⚠️ 入力中は画面に何も表示されませんが、正常です

**成功すると以下のように表示されます：**
```
Enumerating objects: ...
Counting objects: ...
Writing objects: 100% ...
To https://github.com/shitsukawasho-ops/invoice-processor.git
   xxxxx..xxxxx  main -> main
```

### 方法B: GitHub CLIを使用（より簡単）

GitHub CLIがインストール済みの場合（未インストールなら方法Aを使用）：

```bash
# 認証
gh auth login

# プッシュ
git push origin main
```

## 手順4: GitHubで確認

1. **ブラウザで以下のURLにアクセス**
   ```
   https://github.com/shitsukawasho-ops/invoice-processor
   ```

2. **ファイルが表示されているか確認**
   - `app.py`
   - `main.py`
   - `README.md`
   - `services/` フォルダ
   - など、複数のファイルが見えればOK！

## 手順5: Vercelで再度デプロイ

GitHubへのアップロードが完了したら：

1. **Vercelの画面に戻る**
   - `https://vercel.com/new`

2. **ページをリロード**
   - ブラウザの更新ボタンをクリック、または `Command + R`

3. **リポジトリ一覧から「invoice-processor」を探す**

4. **「Import」ボタンをクリック**

5. **設定画面で「Deploy」をクリック**

6. **デプロイ完了を待つ**（2-3分）

## トラブルシューティング

### エラー1: `Permission denied`
→ GitHub Personal Access Tokenが正しくないか、`repo`スコープが選択されていません

### エラー2: `fatal: Authentication failed`
→ ユーザー名またはトークンが間違っています。再度入力してください

### エラー3: `Everything up-to-date`
→ すでにプッシュ済みです。手順4でGitHubを確認してください

## 次のステップ

プッシュが完了したら、私に「プッシュ完了しました」と教えてください。
Vercelでのデプロイをサポートします！
