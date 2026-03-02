# Pokemon Ribbon Tracker

ポケモンのリボン制覇を、**取得計画 + 進捗記録 + 世代間転送確認**まで一気通貫で支援する SvelteKit アプリです。

## 現在の状態（2026-03-03）

- 不可逆転送のUI刷新（警告・2段階確認・確認記録）を実装済み
- トラッカー / ロードマップ / ガイド / クイック / セットアップが利用可能
- `lint` / `check` / `test` は通過

## 使い方（最初にここだけ）

- **参照モード（登録なし）**: 一覧閲覧、転送可否確認、ガイド参照
- **記録モード（登録あり）**: マイポケモン単位で取得進捗・取り逃し・不可逆確認日を保存

## 主要ページ

- `/` トラッカー（検索、フィルタ、取得記録）
- `/roadmap` 世代別ロードマップ（不可逆転送チェック）
- `/guide` リボン/転送/Tips の参照ガイド
- `/quick` プレイ中の簡易確認導線
- `/setup` 所持ゲーム/ハード登録とルート可否確認

## 技術スタック

- SvelteKit 2 / Svelte 5 (Runes) / TypeScript
- Tailwind CSS v4
- Vite 7 + `@sveltejs/adapter-static`（SSG）
- Vitest / ESLint / Prettier / svelte-check

## 開発コマンド

```sh
npm install
npm run dev
npm run lint
npm run check
npm run test
npm run build
```

## ドキュメント

- 設計・移行計画: [docs/rewrite-plan.md](docs/rewrite-plan.md)
- 実装再開ハンドオフ: [docs/irreversible-transfer-ux-handoff.md](docs/irreversible-transfer-ux-handoff.md)
- エージェント運用規約: [CLAUDE.md](CLAUDE.md)
