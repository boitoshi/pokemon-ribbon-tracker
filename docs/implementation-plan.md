# 実装計画

## 完了済み

### Phase 1-2: 安定化（完了）
- Nuxt 3 プロジェクト構築、Pinia 導入、型定義整備
- 9コンポーネントの TypeScript 化（Batch 1）
- PokemonSearch データモデル修正（Batch 2）
- GAME_NAMES 共通定数化 → `utils/gameNames.ts` に一元化済み

### Phase 3: バグ修正・データ拡充（完了）
- カテゴリフィルタ修正: `r.id.includes()` → `CATEGORY_MAP` + `r.category` マッチング
- PokemonDetails: オプショナル `ribbons` の null 安全対策
- ダミーリボン: 3件 → 17件（全世代チャンピオン、コンテスト、バトル施設、思い出、イベント）
- ダミーゲーム: 5件 → 21件（第3〜8世代全タイトル）
- リボンガイド: 20件 → 27件（バトルタワーシンオウ、バトルファクトリー、シンオウコンテスト等）
- `alert` リボンの `category` 修正: `'特性'` → `'イベント'`

### Phase 4: テスト追加（完了）
- `tests/utils/ribbonFilter.test.ts` — 14テスト
- `tests/stores/ribbonProgress.test.ts` — 29テスト
- 既存テスト含め合計55テスト、全パス

---

### Phase 5: 機能改善（完了）
- 5a. 進捗エクスポート/インポート: ストアに `exportProgress()` / `importProgress()` + RibbonMasterChart UI
- 5b. リボン互換性チェック: `selectedPokemonGeneration` getter + `isPokemonCompatible` 世代判定
- 5c. 認定証生成: Canvas API で PNG 画像生成・ダウンロード

### Phase 6: コンテンツ拡充（完了）
- リボンガイド: 27件 → 52件（エメラルドバトルフロンティア、購入リボン、ORAS、バトルツリー等）

### Phase 7: モバイルUI最適化（完了）
- 全10コンポーネント/ページにレスポンシブ Tailwind クラスを適用
- モバイル（`md:` 未満）: パディング・マージン・フォントサイズ・アイコンサイズを縮小
- タブバー横スクロール化、フレックスレイアウト最適化
- 1画面あたりの情報密度を向上

---

## 将来のフェーズ（スコープ外）

- 外部 JSON データソースの整備（GitHub リポジトリ）
- デプロイ設定（GitHub Pages / Vercel）
- E2E テスト / コンポーネントテスト
- アクセシビリティ改善（aria 属性、キーボード操作）
- ダークモード対応
