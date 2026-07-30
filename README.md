# Pokemon Ribbon Tracker

ポケモンのリボン制覇を、**取得計画 + 進捗記録 + 世代間転送確認**まで一気通貫で支援する SvelteKit アプリです。

## 現在の状態（2026-07-29）

- 不可逆転送のUI刷新（警告・2段階確認・確認記録）を実装済み
- UX改善F〜G 完了（モバイル視認性・折りたたみ・長押し情報表示・バナー永続化）
- コードレビュー実施済み（P0/P1/P2全件 完了）
  - P0: スワイプ/タップ誤操作防止、ボトムシートフォーカストラップ、Toast位置最適化、非存在リボン削除
  - P1: dvh対応、checkedSet O(1)化、MyPokemon aria-pressed、urgent/missed理由常設表示
  - P2: importProgressバリデーション強化（isValidMyPokemon）、検索ひらがな/カタカナ正規化、init()再初期化ガード、safe-areaトークン共通化
- 統合検索（/）/ ポケモン・リボン・ソフト詳細（/pokemon /ribbon /game、?p= ?r= ?g= クエリ方式）/ 記録（/box）/ ロードマップ / クイック / ガイド / 設定 が利用可能
- 不要スクリーンショット画像（ルート直下PNG 8件）を削除済み
- `lint` / `check 0 errors` / 全テスト通過（vitest）
- リボン・あかし画像159枚は未アップロード（アップ先 `wp-content/uploads/pokemon-assets/ribbons|marks/`。404時は絵文字フォールバックで表示は壊れない）

**次のアクション**: R2: 中古屋モード（docs/ui-redesign-plan.md 参照。R1 は完了済み）

## 使い方（最初にここだけ）

- **参照モード（登録なし）**: 一覧閲覧、転送可否確認、ガイド参照
- **記録モード（登録あり）**: マイポケモン単位で取得進捗・取り逃し・不可逆確認日を保存

## 主要ページ

- `/` 統合検索ホーム（ポケモン名／リボン名／ソフト名の検索、世代・カテゴリタイル）
- `/pokemon?p=<id>` ポケモン詳細（取得可能リボン/あかし合計、世代別内訳）
- `/ribbon?r=<id>` リボン詳細（条件・対象ソフト・つけられるポケモン逆引き）
- `/game?g=<id>` ソフト詳細（このソフトで取れるリボン一覧）
- `/box` 記録（マイポケモン単位のリボン取得チェックリスト）
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

### データ再生成

正本は `../pokemon-data`（環境変数 `POKEMON_DATA_DIR` で変更可）。

```sh
npm run gen-games         # games.ts
npm run gen-pokemon       # pokemon.ts
npm run gen-ribbons       # ribbons-gen3〜9.ts / marks.ts
npm run gen-ribbon-names  # canonical-ribbon-names.ts
npm run gen-icons
```

## データ層

`src/lib/data/` の `pokemon.ts` / `games.ts` / `ribbons-gen3〜9.ts` / `marks.ts` /
`canonical-ribbon-names.ts` は `../pokemon-data`（リボンは `ribbons/catalog.json` 等）からの
自動生成ファイル。**直接編集禁止**、再生成は上記の `gen-*` コマンドで行う。
手書きは `transfer-routes.ts` と `shadow-pokemon.ts` のみ。

## デプロイ

公開URL: **https://www.pokebros.net/ribbon-tracker/**（Apache 共有ホスティングのサブディレクトリ）

`main` ブランチへの push で GitHub Actions（`.github/workflows/deploy.yml`）が
lint / check / test → `BASE_PATH=/ribbon-tracker` ビルド → FTP アップロードを自動実行します。

### 必要な Secrets（リポジトリ設定に登録）

| Secret           | 内容                                                              |
| ---------------- | ----------------------------------------------------------------- |
| `FTP_SERVER`     | FTP サーバーのホスト名                                            |
| `FTP_USERNAME`   | FTP ユーザー名                                                    |
| `FTP_PASSWORD`   | FTP パスワード                                                    |
| `FTP_SERVER_DIR` | アップロード先（例: `/pokebros.net/ribbon-tracker/`、末尾スラッシュ必須） |

### ローカルでの本番ビルド検証

```sh
npm run build:prod   # BASE_PATH=/ribbon-tracker でビルド
npx vite preview     # http://localhost:4173/ribbon-tracker/ で確認
```

## ドキュメント

- 現行設計正本（R1〜R4）: [docs/ui-redesign-plan.md](docs/ui-redesign-plan.md)
- 設計・移行計画（アーカイブ: Nuxt→SvelteKit 移行時の計画）: [docs/rewrite-plan.md](docs/rewrite-plan.md)
- 実装再開ハンドオフ（アーカイブ）: [docs/irreversible-transfer-ux-handoff.md](docs/irreversible-transfer-ux-handoff.md)
- エージェント運用規約: [CLAUDE.md](CLAUDE.md)
