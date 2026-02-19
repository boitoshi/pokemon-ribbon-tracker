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

### Phase 8: UX 再設計 — タブ統合・情報導線の改善（完了）

現状5タブは機能が分散し、ユーザーがどこで何をすればいいか迷う。
ユーザー視点で「リボンを調べる → 取り方を知る → チェックする」を一連の流れにする。

#### 現状の問題
```
[リボン一覧] フィルタ付きカード → クリックで別タブのガイドへ飛ぶ
[リボン取得チャート] 世代/ゲーム別の取得状況 → ガイド情報なし
[リボン王チャート] チェックリスト → 進捗がポケモン情報に反映されない
[獲得ガイド] 選択リボンの詳細 → 単独タブの必要性が薄い
[転送方法] 静的コンテンツ → そのまま残す
```

#### 8a. タブ構成の再編（5タブ → 3タブ）
| Before | After | 変更内容 |
|--------|-------|----------|
| リボン一覧 + 獲得ガイド | **リボン管理** | 一覧にフィルタ・検索・チェック機能を統合。リボンカードを展開するとガイドをインライン表示 |
| リボン取得チャート | ↑ に統合 | 世代/ゲーム別グルーピングはフィルタとして吸収。チャート内リボンにもガイド導線を追加 |
| リボン王チャート | **進捗ダッシュボード** | 全体進捗・世代別進捗・認定証・エクスポート/インポート |
| 転送方法 | **転送ガイド** | 変更なし |

**リボン管理タブの詳細:**
- 上部: フィルタバー（世代・カテゴリ・取得状態）+ 検索ボックス
- リボンカード: チェックボックス付き → その場でチェック/解除可能（リボン王チャートと同期）
- カード展開: クリックでアコーディオン展開 → ガイド・取得条件・対応ゲームをインライン表示
- 互換性バッジ: 選択ポケモンが取得不可なリボンはグレーアウト

#### 8b. PokemonDetails にリアルタイム進捗を反映（Bug修正）
- **問題**: リボン王チャートでチェックしても PokemonDetails の進捗バーが常に 0%
- **対応**: store の `currentCheckedRibbons` と `ribbons` から進捗を算出し表示
- 取得済み数 / 取得可能数 / 全リボン数を表示

#### 8c. ステータスフィルタの修正（Bug修正）
- **問題**: 「取得済み/未取得」フィルタボタンが機能しない（`filteredRibbons` が `status` を無視）
- **対応**: store の `currentCheckedRibbons` と照合するロジックを追加

#### 8d. コード品質改善
- `CATEGORY_MAP` を `utils/ribbonFilter.ts` に抽出して一元管理
- `PokemonSearch.vue`: 使われない `isLoading` の削除
- `RibbonGuide.vue`: 「最終更新」の固定値化 or 削除
- `HelpfulResources.vue`: 空リンクの整理
- 未使用の `setCheckedRibbons` action の削除

---

### Phase 9: マイポケモン登録機能（完了）

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

### Phase 10: 外部データソース整備（完了）
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

### Phase 11 (前倒し): UX 改善フェーズ（完了）

`docs/ux-improvement-proposal.md` の8提案を実装。

#### 完了した提案

| 提案 | 内容 | 変更ファイル |
|------|------|-------------|
| A | オンボーディング表示（初回のみ・3ステップ） | `pages/index.vue` |
| B | 2カラムレイアウト（デスクトップ: lg以上） | `pages/index.vue` |
| C | タブを5→2に統合（進捗ダッシュボード廃止、リボン管理に統合） | `pages/index.vue`, `components/RibbonManager.vue` |
| D | フィルター折りたたみ＋アクティブバッジ | `components/RibbonFilter.vue` |
| E | PokemonDetails 内に登録ボタン追加 + triggerRegisterForm フラグ | `components/PokemonDetails.vue`, `components/MyPokemonPanel.vue`, `stores/ribbonProgress.ts` |
| F | トースト通知 (`useToast` composable + `AppToast.vue`) | `composables/useToast.ts`, `components/AppToast.vue` |
| H | 「特殊」カテゴリをフィルターに追加 | `utils/ribbonFilter.ts` |

#### 追加実装（提案外）

- **Lv.制限リボン警告バナー**: Lv.50以下制限のリボンが未取得の場合に RibbonManager 上部に警告表示
- **リボン取得チャート（フェーズ別）**: 取得推奨順序をフェーズ別に可視化
  - Phase 1（赤）: レベル制限あり（最優先）
  - Phase 2（黄）: コンテスト
  - Phase 3（緑）: ストーリー・バトル・その他
  - 取得不可リボンを折りたたみで表示（理由付き）
  - 進捗バーの分母を「取得可能数」に（FR/LG など出身ゲームで変化）
  - 新規コンポーネント: `components/PhaseSection.vue`, `components/RibbonChartRow.vue`
  - `utils/ribbonEligibility.ts` に `getAcquisitionPhase()` 追加
- **転送ガイド改善**: 第3世代リボン取得推奨順序セクションを追加

#### 未実装（スコープ外）

- 提案 G: 検索結果にタイプ・世代を表示、図鑑番号検索

---

### Phase 12: デプロイ・CI

#### 11a. GitHub Pages（SSG）
- `nuxt.config.ts` に `ssr: false` + `nitro.preset: 'github-pages'` 設定
- GitHub Actions ワークフロー（`.github/workflows/deploy.yml`）
  - push to main → `npm ci` → `npm run generate` → deploy to gh-pages

#### 11b. CI パイプライン
- PR 時: lint + typecheck + test を自動実行
- main マージ時: ビルド + デプロイ

---

### Phase 13: アクセシビリティ・ダークモード

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

### Phase 14: テスト拡充

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

| 優先度 | Phase | 状態 | 理由 |
|--------|-------|------|------|
| ~~**高**~~ | ~~Phase 8（UX再設計 + バグ修正）~~ | ✅ 完了 | |
| ~~**高**~~ | ~~Phase 9（マイポケモン登録）~~ | ✅ 完了 | |
| ~~**高**~~ | ~~Phase 10（データ整備）~~ | ✅ 完了 | |
| ~~**中**~~ | ~~Phase 11 前倒し（UX改善 A-H）~~ | ✅ 完了 | |
| **高** | Phase 12（デプロイ + CI） | 未着手 | ユーザーがアクセスできる状態にする |
| **中** | Phase 14（テスト拡充） | 未着手 | リファクタリング後の品質保証 |
| **低** | Phase 13（a11y + ダークモード） | 未着手 | UX 向上だが機能的にはなくても使える |
