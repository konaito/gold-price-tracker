# Vercelデプロイ手順

## 前提条件
- Vercelアカウント（GitHubアカウントで連携可能）
- このリポジトリがGitHubにプッシュされていること

## デプロイ手順

### 1. Vercelにプロジェクトをインポート
1. [Vercel](https://vercel.com)にログイン
2. 「Add New Project」をクリック
3. GitHubリポジトリからこのプロジェクトを選択

### 2. プロジェクト設定
以下の設定を確認してください：

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `bun run build`
- **Output Directory**: `.next`
- **Install Command**: `bun install`

### 3. 環境変数
現在、環境変数は不要です（Yahoo Finance APIは公開APIです）。

### 4. デプロイ
「Deploy」ボタンをクリックしてデプロイを開始します。

## キャッシュ設定

このプロジェクトには以下のキャッシュ設定が含まれています：

### APIルート
- **キャッシュ期間**: 5分（300秒）
- **Stale-While-Revalidate**: 10分（600秒）
- **データ取得期間**: 6ヶ月（180日）
- **初期表示範囲**: 1ヶ月（30日）

### 設定ファイル
- `vercel.json`: Vercel固有の設定
- `next.config.ts`: Next.js設定（PWA対応）

## データ更新について

- APIは5分ごとにキャッシュされます
- クライアント側は10分ごとにデータを更新します
- キャッシュが期限切れの場合、自動的に新しいデータを取得します

## パフォーマンス最適化

1. **Edge Functions**: 東京リージョン（hnd1）を使用
2. **キャッシュ**: VercelのCDNでキャッシュ
3. **PWA**: オフライン対応
4. **レスポンシブデザイン**: モバイル最適化

## トラブルシューティング

### ビルドエラー
```bash
# ローカルでビルドテスト
cd frontend
bun install
bun run build
```

### キャッシュクリア
Vercelのダッシュボードから「Redeploy」を実行してください。

## コスト
- Vercel Hobbyプラン: 無料
- 月間100GBの帯域幅まで無料
- このプロジェクトは無料枠内で動作します

