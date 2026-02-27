# SvelteKit 全面書き直し実装計画

> 作成日: 2026-02-27
> 最終更新: 2026-02-27
> ステータス: 実装中（Phase 3 完了）
> 目標: Nuxt3→SvelteKit2 完全移行 + UX抜本改善

## 進捗サマリー

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase 0 | SvelteKit セットアップ・データ移植 | ✅ 完了 |
| Phase 1 | コアトラッカー（Runes ストア + 基本UI） | ✅ 完了 |
| Phase 2 | セットアップウィザード（所持ゲーム・ハード登録） | ✅ 完了 |
| Phase 3 | ロードマップビュー（/roadmap） | ✅ 完了 |
| Phase 4 | クイックチェックモード | 🔜 未着手 |
| Phase 5 | ガイドページ（SSG参照ページ群） | 🔜 未着手 |
| Phase 6 | PWA完成 + Gen9データ整備 | 🔜 未着手 |

---

## 1. 書き直しの根拠

### なぜ SvelteKit か

| 比較軸 | Nuxt 3（現状） | SvelteKit 2（移行後） |
|--------|--------------|---------------------|
| バンドルサイズ | Vue3 runtime ~34KB gzip | Svelte runtime ~1.5KB gzip |
| チェックボックス多数の描画 | 仮想DOM diffing | コンパイル時リアクティビティ（差分なし） |
| 状態管理 | Pinia（外部依存） | $state Runes（組み込み） |
| SSG 参照ページ | ○ | ◎ static adapter |
| PWA | @vite-pwa/nuxt | vite-plugin-pwa（同じ） |
| モバイル体感速度 | 良 | 優秀（バンドル小・FCP速い） |
| メンテナンス | Nuxt/Vue 両追従必要 | SvelteKit のみ追従 |

### 移行コストが低い理由

以下のファイルは **フレームワーク非依存の純粋TypeScript** なのでそのまま再利用:

```
data/ribbons-gen*.ts   → src/lib/data/ に移動のみ
data/games.ts          → 同上
data/marks-gen9.ts     → 同上
data/shadow-pokemon.ts → 同上
data/pokemon-gen3.ts   → 同上
types/index.ts         → src/lib/types.ts に移動のみ
utils/ribbonEligibility.ts → src/lib/utils/ に移動のみ
utils/ribbonFilter.ts  → 同上
utils/ribbonGuideData.ts → 同上
utils/gameNames.ts     → 同上
utils/pokemonMapper.ts → 同上
utils/dataFetcher.ts   → 同上（~import 削除のみ）
```

**実質の書き直し対象**: コンポーネント(.vue→.svelte) + ストア(Pinia→Svelte Runes)

---

## 2. 新技術スタック

```
SvelteKit 2.x          フレームワーク
Svelte 5 (Runes)       コンポーネント + 状態管理
TypeScript 5.x         型システム
Tailwind CSS v4        スタイリング（CSS-first config）
@sveltejs/adapter-static  完全SSG
vite-plugin-pwa        PWA / Service Worker / オフライン
Vitest                 テスト（現状と同じ）
ESLint + Prettier      Lint / Format
```

### Tailwind v4 の変更点（設定ファイル不要）

```css
/* src/app.css */
@import "tailwindcss";

/* カスタムテーマはここに書く */
@theme {
  --color-poke-red: #ee1515;
  --color-poke-blue: #3b4cca;
}
```

`tailwind.config.js` は不要。`postcss.config.js` も不要。

---

## 3. ディレクトリ構成

```
src/
├── lib/
│   ├── data/                    ← 現 data/ をそのままコピー
│   │   ├── ribbons-gen3.ts
│   │   ├── ribbons-gen4.ts
│   │   ├── ribbons-gen5.ts
│   │   ├── ribbons-gen6.ts
│   │   ├── ribbons-gen7.ts
│   │   ├── ribbons-gen8.ts
│   │   ├── ribbons-gen9.ts
│   │   ├── marks-gen9.ts
│   │   ├── games.ts
│   │   ├── pokemon-gen3.ts
│   │   └── shadow-pokemon.ts
│   ├── types.ts                 ← 現 types/index.ts（拡張あり）
│   ├── utils/                   ← 現 utils/ をそのままコピー
│   │   ├── ribbonEligibility.ts
│   │   ├── ribbonFilter.ts
│   │   ├── ribbonGuideData.ts
│   │   ├── gameNames.ts
│   │   ├── pokemonMapper.ts
│   │   └── dataFetcher.ts
│   ├── stores/                  ← 現 Pinia → Svelte Runes
│   │   ├── ribbonProgress.svelte.ts   (メインストア)
│   │   ├── setup.svelte.ts            (所持ゲーム/ハード) ← 新規
│   │   └── toast.svelte.ts            (トースト通知)
│   └── components/
│       ├── tracker/             ← トラッカーUI
│       │   ├── PokemonSearch.svelte
│       │   ├── PokemonDetails.svelte
│       │   ├── MyPokemonPanel.svelte
│       │   ├── RibbonCard.svelte      (アコーディオン + チェック)
│       │   ├── RibbonFilter.svelte
│       │   ├── RoadmapView.svelte     ← 新規・キラー機能
│       │   ├── RoadmapStep.svelte     ← 新規
│       │   ├── TransferArrow.svelte   ← 新規
│       │   └── QuickCheck.svelte      ← 新規・モバイル最適化
│       ├── guide/               ← 参照ページUI
│       │   ├── GameGuideSection.svelte
│       │   └── TransferStepDetail.svelte
│       └── ui/                  ← 共通UI部品
│           ├── Toast.svelte
│           ├── Badge.svelte
│           ├── ProgressBar.svelte
│           └── Modal.svelte
├── routes/
│   ├── +layout.svelte           (アプリシェル・ナビゲーション)
│   ├── +layout.ts               (SSG設定: prerender = true)
│   ├── +page.svelte             (/ メイントラッカー)
│   ├── setup/
│   │   └── +page.svelte         (/setup 初回セットアップ)
│   └── guide/
│       ├── +page.svelte         (/guide ガイドインデックス)
│       ├── transfer/
│       │   └── +page.svelte     (/guide/transfer 完全転送ガイド)
│       └── games/
│           └── [id]/
│               ├── +page.ts     (静的パラメータ生成)
│               └── +page.svelte (/guide/games/[id] ゲーム別辞典)
├── app.html
└── app.css                      (Tailwind v4 インポート)
```

---

## 4. 型定義の拡張（types.ts）

現在の型から以下を追加・変更:

```typescript
/** マイポケモン（個体情報） — currentGame/level/isHome を追加 */
export interface MyPokemon {
  id: string;
  pokemonId: string;
  nickname: string;
  originGame: string;      // 出身ゲーム（変更なし）
  currentGame: string;     // ★新規: 今どのゲームにいるか
  currentGeneration: number; // ★新規: 現在の世代
  level: number;           // ★新規: レベル（レベル制限判定に必須）
  isTransferredToHome: boolean; // ★新規: HOME転送済みか
  memo: string;
  createdAt: string;
}

/** 所持セットアップ（新規） */
export interface Setup {
  ownedGames: string[];       // ゲームID配列
  ownedHardware: Hardware[];  // 所持ハード
  setupCompleted: boolean;
}

export type Hardware = 'gba' | 'ds_lite' | 'dsi' | '3ds' | 'switch';

/** リボン定義 — transferable フラグを追加 */
export interface Ribbon {
  id: string;
  name: string;
  description: string;
  generation: number;
  games: string[];
  category: string;
  type?: 'ribbon' | 'mark';
  requirements?: string;
  image_url?: string;
  eligibility?: RibbonEligibility;
  transferable?: boolean; // ★新規: HOME転送後も残るか（デフォルト true）
}

/** 転送ルート定義（新規） */
export interface TransferRoute {
  id: string;
  fromGeneration: number;
  toGeneration: number;
  method: string;           // 'palpark' | 'poke-transfer' | 'poke-bank' | 'home'
  methodName: string;       // 'パルパーク'
  hardwareRequired: Hardware[];
  softwareRequired: string[]; // ゲームID
  dailyLimit?: number;        // パルパーク: 6
  restrictions: string[];
  isDeprecated?: boolean;     // ポケモンバンク
  deprecationNote?: string;
}
```

---

## 5. ストア設計（Svelte 5 Runes）

### ribbonProgress.svelte.ts

```typescript
// Svelte 5 クラスベース（Pinia store の移植）
class RibbonProgressStore {
  selectedPokemon = $state<Pokemon | null>(null);
  ribbons = $state<Ribbon[]>([]);
  games = $state<Game[]>([]);
  pokemonList = $state<PokemonDetail[]>([]);
  myPokemonList = $state<MyPokemon[]>([]);
  activeMyPokemonId = $state<string | null>(null);
  progress = $state<Record<string, string[]>>({});

  // derived 相当
  currentCheckedRibbons = $derived(
    this.activeMyPokemonId
      ? (this.progress[this.activeMyPokemonId] ?? [])
      : (this.progress[this.selectedPokemon?.id ?? ''] ?? [])
  );

  totalCompletion = $derived(
    this.ribbons.length === 0 ? 0
    : Math.round((this.currentCheckedRibbons.length / this.ribbons.length) * 100)
  );

  // actions はメソッドとして定義
  toggleRibbon(pokemonId: string, ribbonId: string) { ... }
  // ...
}

export const ribbonProgress = new RibbonProgressStore();
```

### setup.svelte.ts（新規）

```typescript
class SetupStore {
  ownedGames = $state<string[]>([]);
  ownedHardware = $state<Hardware[]>([]);
  setupCompleted = $state(false);

  canTransfer(fromGen: number, toGen: number): boolean { ... }
  canGetRibbonFromGame(gameId: string): boolean { ... }
  // ...

  // localStorage 永続化
  save() { localStorage.setItem('setup', JSON.stringify(...)); }
  load() { ... }
}

export const setup = new SetupStore();
```

---

## 6. 実装フェーズ

### Phase 0: プロジェクトセットアップ ✅ 完了

```bash
npx sv create pokemon-ribbon-tracker-v2
# テンプレート: SvelteKit minimal
# TypeScript: Yes
# Tailwind: Yes（v4）
# ESLint + Prettier: Yes

# 依存追加
npm i vite-plugin-pwa @sveltejs/adapter-static
npm i -D vitest @vitest/coverage-v8
```

- `adapter-static` 設定
- Tailwind v4 CSS設定
- データファイル・型・ユーティリティの移植（コピー + import修正）
- ESLint / Prettier / Vitest 設定

---

### Phase 1: コアトラッカー ✅ 完了

**目標**: 現状アプリと同等の機能を SvelteKit で実現

実装項目:
- `ribbonProgress.svelte.ts` ストア（Pinia移植）
- `toast.svelte.ts` ストア
- `PokemonSearch.svelte`（検索ボックス + サジェスト）
- `PokemonDetails.svelte`（選択ポケモン情報）
- `MyPokemonPanel.svelte`（マイポケモン一覧、横スクロール）
- `RibbonCard.svelte`（チェックボックス + アコーディオン）
- `RibbonFilter.svelte`（折りたたみフィルター）
- `Toast.svelte`（通知コンポーネント）
- `/+page.svelte`（2カラムレイアウト組み立て）

**完了条件**:
- ポケモン検索・選択・マイポケモン登録ができる
- リボンのチェックができ localStorage に保存される
- エクスポート/インポートができる

---

### Phase 2: セットアップウィザード ✅ 完了

**目標**: 所持ゲーム・ハードを登録し、取得不可リボンをグレーアウト

実装項目:
- `setup.svelte.ts` ストア
- `/setup/+page.svelte`（ゲーム・ハードチェックリストUI）
- 初回アクセス時に `/setup` へリダイレクト
- リボンカードへの「取得不可（未所持ゲーム）」バッジ追加
- `canGetRibbonFromGame()` ロジック

**完了条件**:
- 所持ゲームを設定すると、未所持ゲーム限定リボンがグレーアウトされる
- 「コロシアムを入手すれば+2リボン取れます」の提案表示

---

### Phase 3: ロードマップビュー ✅ 完了

**目標**: 「今何をすべきか」を世代別ステップで表示するキラー機能

実装項目:
- 転送ルートデータ `src/lib/data/transfer-routes.ts`
- `RoadmapView.svelte`（世代別ステップ一覧）
- `RoadmapStep.svelte`（1世代分のリボングループ）
- `TransferArrow.svelte`（世代間の転送ステップUI）
- レベル制限リボンを最上部に「今すぐやること」セクションとして表示
- MyPokemon.level からレベル制限判定の自動化
- 所持ゲームに基づく「取得不可」グレーアウト

**表示ロジック**:
```
緊急（🔴）: eligibility.type === 'level_max' && 未取得 && level > maxLevel が近い
通常（📍）: 世代順に並べたリボン群
スキップ（🔒）: 未所持ゲーム限定
```

**完了条件**:
- ロードマップビューが世代別に表示される
- 「今すぐ」セクションがレベル制限リボンを正しく表示する
- 転送ステップをタップすると必要ハード・手順が展開される

---

### Phase 4: クイックチェックモード 🔜 未着手

**目標**: ゲーム機の横に置いて片手で操作できるUI

実装項目:
- `QuickCheck.svelte`（フルスクリーン型リボン1件ずつ表示）
- 大きいタップ領域（行全体がチェックトリガー）
- 前後ナビゲーションボタン（← 前 / 次 →）
- 「次の未取得へ」ジャンプボタン
- 現在世代フィルター（「今 Gen3 をプレイ中」で Gen3 リボンのみ表示）
- スワイプジェスチャー（Touch Events API）
- 下部ナビバーからアクセスできるボタン

**完了条件**:
- スマホ片手で快適にリボンをチェックできる
- スワイプで前後移動できる

---

### Phase 5: ガイドページ 🔜 未着手

**目標**: 「このゲームで取れるリボンは?」参照ページ群（SSG / SEO対応）

実装項目:

#### `/guide/transfer`
- 現 TransferGuide.vue を大幅強化
- ハードウェア要件を視覚的に表示（アイコン）
- パルパーク: 1日6匹制限、ポケモンバンク終了注意など詳細化
- 所持ハードに基づき「あなたは○○まで転送できます」を表示

#### `/guide/games/[id]`
- ゲームID → 対応リボン一覧を SSG で生成
- `+page.ts` の `entries()` で全ゲームの静的ページを生成
- 取得可能数 / 全体数 / レベル制限有無を表示
- 「このゲームを所持マーク」→ `/setup` への誘導リンク

#### SEO設定
- `<svelte:head>` で title / description / og:title
- ゲーム別ページは `/guide/games/emerald` のようなパーマリンク

**完了条件**:
- `/guide/games/emerald` を開くとエメラルドで取れる全リボンが表示される
- 全ページが静的HTML として生成される

---

### Phase 6: PWA + データ整備 🔜 未着手

**目標**: オフライン動作 + リボンデータの最終検証

#### PWA設定
```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ポケモンリボン制覇トラッカー',
        short_name: 'リボントラッカー',
        theme_color: '#3b4cca',
        display: 'standalone',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
};
```

#### Gen9リボンデータ検証・追加
確認が必要な項目:
- SV DLC（碧の仮面・藍の円盤）追加リボン
- テラスタルリボン（テラレイドバトル関連）
- SV 努力値MAX リボン
- HOME専用マーク・リボン

#### transferable フラグ整備
HOME転送後にリボンが保持されるかを全リボンで確認・記載。

**完了条件**:
- オフラインでアプリが動作する
- 「ホーム画面に追加」でネイティブアプリ感のある動作

---

## 7. 新旧対応表（コンポーネント移植ガイド）

| 現在（Nuxt/Vue） | 移行後（SvelteKit/Svelte） | 変更量 |
|-----------------|---------------------------|--------|
| `stores/ribbonProgress.ts` | `stores/ribbonProgress.svelte.ts` | 中（Runes記法に変換） |
| `components/PokemonSearch.vue` | `components/tracker/PokemonSearch.svelte` | 小 |
| `components/PokemonDetails.vue` | `components/tracker/PokemonDetails.svelte` | 小 |
| `components/MyPokemonPanel.vue` | `components/tracker/MyPokemonPanel.svelte` | 中（level/currentGame追加） |
| `components/RibbonManager.vue` | `components/tracker/RibbonCard.svelte` + `/+page.svelte` | 中 |
| `components/RibbonFilter.vue` | `components/tracker/RibbonFilter.svelte` | 小 |
| `components/TransferGuide.vue` | `routes/guide/transfer/+page.svelte` | 大（内容拡充） |
| `components/AppToast.vue` | `components/ui/Toast.svelte` | 小 |
| `composables/useToast.ts` | `stores/toast.svelte.ts` | 小 |
| `pages/index.vue` | `routes/+page.svelte` | 中 |
| — | `routes/setup/+page.svelte` | 新規 |
| — | `components/tracker/RoadmapView.svelte` | 新規・大 |
| — | `components/tracker/QuickCheck.svelte` | 新規・中 |
| — | `routes/guide/games/[id]/+page.svelte` | 新規・中 |

---

## 8. 開発・デプロイ環境

### 開発コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # 静的ビルド（adapter-static）
npm run preview    # ビルド確認
npm run check      # svelte-check（型チェック）
npm run lint       # ESLint
npm run test       # Vitest
```

### デプロイ

- **推奨**: Vercel（SvelteKit ネイティブサポート、無料）
- **代替**: Netlify / GitHub Pages（adapter-static の場合どこでも）
- 静的ファイルのみなので CDN 配信、サーバー不要

---

## 9. 実装しない範囲（スコープ外）

- バックエンド・データベース（localStorage のみ）
- ユーザー認証・クラウド同期
- 多言語対応
- ポケモンGO連携
- リアルタイム協力機能

---

## 10. 既知のリスクと対策

| リスク | 対策 |
|--------|------|
| Svelte 5 Runes は比較的新しい（2024リリース） | 公式ドキュメント + REPL で事前検証 |
| Gen9リボンデータの正確性 | Serebii.net / Bulbapedia でクロスチェック |
| ポケモンバンク終了タイムライン不明 | 「早急に転送推奨」の注記を入れ、最新情報リンクを貼る |
| パルパーク DS/DSiの区別が複雑 | ハードウェア要件を明示、DSiNGを強調表示 |
