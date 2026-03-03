# Pokemon Ribbon Tracker

ポケモンのリボン制覇を、**取得計画 + 進捗記録 + 世代間転送確認**まで一気通貫で支援する SvelteKit アプリです。

## 現在の状態（2026-03-03）

- 不可逆転送のUI刷新（警告・2段階確認・確認記録）を実装済み
- UX改善F〜G 完了（モバイル視認性・折りたたみ・長押し情報表示・バナー永続化）
- コードレビュー実施済み（P0/P1/P2全件 完了）
  - P0: スワイプ/タップ誤操作防止、ボトムシートフォーカストラップ、Toast位置最適化、非存在リボン削除
  - P1: dvh対応、checkedSet O(1)化、MyPokemon aria-pressed、urgent/missed理由常設表示
  - P2: importProgressバリデーション強化（isValidMyPokemon）、検索ひらがな/カタカナ正規化、init()再初期化ガード、safe-areaトークン共通化
- トラッカー / ロードマップ / ガイド / クイック / セットアップが利用可能
- 不要スクリーンショット画像（ルート直下PNG 8件）を削除済み
- `lint` / `check 0 errors` / `test 69/69` 通過

**次のアクション**: G-1（ガイドリボン検索）→ Phase 6（PWA + Gen9データ整備）

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
