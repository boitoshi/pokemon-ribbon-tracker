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

### Phase 8: UX 再設計 — タブ統合・情報導線の改善（完了）

#### 8a. タブ構成の再編（5タブ → 3タブ）
- `RibbonManagement.vue`: リボン一覧 + 獲得ガイド + チャートを統合。フィルタ・検索・チェックボックス・アコーディオンガイド
- `ProgressDashboard.vue`: 進捗ダッシュボード（世代別・カテゴリ別進捗 + 認定証 + エクスポート/インポート）
- `TransferGuide.vue`: 転送ガイド（変更なし）
- `index.vue`: 3タブ構成に簡素化、フィルタロジックを RibbonManagement に移譲

#### 8b. PokemonDetails にリアルタイム進捗を反映（Bug修正）
- `store.totalCompletion` と `store.currentCheckedRibbons` で進捗をリアルタイム表示
- 取得済み数 / 取得可能数を表示

#### 8c. ステータスフィルタの修正（Bug修正）
- `filteredRibbons` に `store.currentCheckedRibbons` との照合ロジックを追加

#### 8d. コード品質改善
- `CATEGORY_MAP` → `utils/ribbonFilter.ts` に抽出
- `PokemonSearch.vue`: 未使用 `isLoading` 削除
- `RibbonGuide.vue`: 「最終更新」セクション削除
- `HelpfulResources.vue`: 空リンクのリソースリスト削除、コミュニティリンクのみ残す
- `stores/ribbonProgress.ts`: 未使用 `setCheckedRibbons` action 削除

---

## 次期フェーズ


### Phase 9: マイポケモン登録機能

バックエンド不要、localStorage で完結するクライアントサイド実装。

#### 9a. データモデル
```typescript
interface MyPokemon {
  id: string;              // 内部ID（自動生成）
  pokemonId: string;       // 図鑑のポケモンID
  nickname: string;        // ニックネーム（任意）
  originGame: string;      // 出身ゲーム
  memo: string;            // メモ（任意）
  createdAt: string;       // 登録日
}
```
- store に `myPokemonList: MyPokemon[]` を追加
- `progress` は `myPokemon.id` をキーに管理（同じポケモンを複数登録可能）

#### 9b. UI
- ポケモン選択後に「マイポケモンに登録」ボタン
- サイドバー or ドロワーにマイポケモン一覧を表示
- マイポケモン切替で進捗が即座に反映
- 登録・編集・削除の CRUD 操作

#### 9c. データ連携
- 既存のエクスポート/インポートに `myPokemonList` を含める
- マイポケモンごとにリボン進捗を独立管理

---

### Phase 10: 外部データソース整備
ダミーデータから実データへの移行。

#### 10a. pokemon-data リポジトリのセットアップ
- `boitoshi/pokemon-data` リポジトリに JSON データを配置
  - `pokemon.json`: 全ポケモン（少なくともリボン対象の Gen3〜9）
  - `ribbons.json`: 全リボン（正式名称・世代・カテゴリ・取得条件）
  - `games.json`: 全タイトル（Gen3〜9、FRLG・コロシアム・XD 含む）
- JSON スキーマのバリデーション

#### 10b. dataFetcher の改善
- フェッチ成功/失敗の状態管理改善（ローディング表示との連動）
- フォールバック時にユーザーへ通知（「オフラインデータを使用中」等）
- キャッシュ戦略（sessionStorage or localStorage）

#### 10c. Gen 9（SV）対応
- フィルタに世代9を追加
- ゲーム名マップに SV / ゼロの秘宝 を追加
- Gen 9 対応リボンの追加

---

### Phase 11: デプロイ・CI

#### 11a. GitHub Pages（SSG）
- `nuxt.config.ts` に `ssr: false` + `nitro.preset: 'github-pages'` 設定
- GitHub Actions ワークフロー（`.github/workflows/deploy.yml`）
  - push to main → `npm ci` → `npm run generate` → deploy to gh-pages

#### 11b. CI パイプライン
- PR 時: lint + typecheck + test を自動実行
- main マージ時: ビルド + デプロイ

---

### Phase 12: アクセシビリティ・ダークモード

#### 12a. アクセシビリティ
- タブ: `role="tablist"` / `role="tab"` / `aria-selected` / `role="tabpanel"`
- チェックリスト: `aria-checked`、フィルタボタン: `aria-pressed`
- キーボード操作（タブ矢印キー移動、フォーカス管理）
- 色のみに依存しないステータス表示 + コントラスト比の検証（WCAG 2.1 AA）

#### 12b. ダークモード
- Tailwind `darkMode: 'class'` + `useColorMode()` composable
- ヘッダーにテーマ切替トグル配置
- 全コンポーネントに `dark:` バリアントを追加

---

### Phase 13: テスト拡充

#### 13a. 未テストのストアアクション
- `exportProgress` / `importProgress` のテスト（正常系 + 異常系）

#### 13b. コンポーネントテスト（@nuxt/test-utils）
- `PokemonSearch.vue`: 検索入力・結果表示・選択
- `RibbonFilter.vue`: フィルタ適用・リセット
- 統合後の「リボン管理」タブ: チェック・フィルタ・ガイド展開

#### 13c. インテグレーションテスト
- フィルタ → リボンリスト → ガイド展開の一連の流れ
- エクスポート → インポートの往復
- マイポケモン切替 → 進捗反映

---

## 推奨実施順序

| 優先度 | Phase | 理由 |
|--------|-------|------|
| **高** | Phase 8（UX再設計 + バグ修正） | ユーザー体験の根本改善。壊れた機能の修正を含む |
| **高** | Phase 9（マイポケモン登録） | 「自分のポケモンの進捗を管理する」という核心機能 |
| **高** | Phase 10（データ整備） | ダミーデータ3件では実用不可 |
| **中** | Phase 11（デプロイ + CI） | ユーザーがアクセスできる状態にする |
| **中** | Phase 13（テスト） | リファクタリング後の品質保証 |
| **低** | Phase 12（a11y + ダークモード） | UX 向上だが機能的にはなくても使える |
