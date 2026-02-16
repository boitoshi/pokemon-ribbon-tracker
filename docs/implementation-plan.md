# 残り実装計画（次セッション用）

## Batch 1: 5コンポーネント TypeScript 化

### 1a. TransferGuide.vue
- `<script setup lang="ts">` を追加（現在は template-only）

### 1b. HelpfulResources.vue
- `lang="ts"` 追加
- Resource interface 定義
- `example.com` リンク → 空文字に修正（templateで `v-if="resource.link"` 処理済み）

### 1c. RibbonFilter.vue
- `lang="ts"` 追加
- `import type { FilterState } from '~/types'`
- emit/reactive を型付け
- 関数パラメータに型アノテーション

### 1d. RibbonsList.vue
- `lang="ts"` 追加
- `defineProps<{ ribbons: Ribbon[]; pokemon: Pokemon | null }>()`
- `defineEmits<{ (e: 'select-ribbon', ribbon: Ribbon): void }>()`
- 存在しない `compatible_pokemon` / `is_special` 参照を削除（常に true を返すよう簡素化）
- 不要な `import { defineProps, defineEmits } from 'vue'` を削除

### 1e. RibbonGuide.vue
- `lang="ts"` 追加
- `defineProps<{ selectedRibbon: Ribbon | null }>()`
- `formatGames`, `getRibbonGuide`, `getRibbonTips` に型アノテーション

---

## Batch 2: PokemonSearch データモデル修正

`components/PokemonSearch.vue`:
- `allPokemon: PokemonDetail[]` / `selectedPokemon: Pokemon | null` props を宣言
- ダミーデータ削除 → `props.allPokemon` からフィルタリング
- `PokemonDetail` → `Pokemon` 型変換マッピング

---

## Batch 3: 検証

```bash
npm run lint:fix
npm run format
npm run build
```

---

## サブエージェント委譲

| サブエージェント | 対象 | model |
|----------------|------|-------|
| #1 | Batch 1 (5コンポーネントTS化) | sonnet |
| #2 | Batch 2 (PokemonSearch修正) | sonnet |
| CLI | Batch 3 (検証) | - |

---

## 将来のフェーズ（スコープ外）

- Phase 3: 全リボンガイドデータ実装
- Phase 4: Vitest テスト追加、デプロイ設定
- GAME_NAMES の共通定数化（RibbonChart と RibbonGuide で重複）
- Pokemon vs PokemonDetail の型統一
