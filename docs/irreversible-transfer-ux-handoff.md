# 不可逆転送UX刷新 ハンドオフ

> 作成日: 2026-03-02
> 最終更新: 2026-03-03（UX改善フェーズG完了）
> 目的: セッション切断時でも、不可逆転送UX刷新の実装を安全に再開できる状態を維持する。

## 現在の進捗

- Phase A: ✅ 完了
- Phase B: ✅ 完了
- Phase C: ✅ 完了
- Phase D: ✅ 完了
- Phase E: ✅ 完了
- UX改善F: ✅ 完了（モバイル視認性・オンボーディング・確認UI強化・QuickCheck状態表示）
- UX改善G: ✅ 完了（折りたたみ・バナー永続化・リセット確認UI・長押しToast・全展開ボタン）

直近検証結果: `npm run lint` / `npm run check 0 errors 0 warnings` / `npm run test 12/12` すべて成功。

**次のアクション**: G-1（ガイドリボン検索）→ Phase 6（PWA + Gen9データ整備）

## 非交渉要件

1. **不可逆転送の明示**
  - 転送操作は「戻せない」ことを常に明示する。
  - 曖昧表現（例: たぶん戻せない）は禁止。
2. **2段階確認**
   - 実行前に最低2回の明示確認を要求する。
  - 最終確認は「不可逆」を含む同意で固定する。
3. **ハード要件の OR 条件（代替手段）対応**
  - ORは「必要リボン達成条件」ではなく「転送時のハード要件/手段の代替条件」を指す。
  - 例: 手段Aが不可でも、手段Bで要件を満たすなら通過可能。
4. **missed の手動変更可**
  - ユーザーは missed 状態を手動で変更できる。
  - 少なくとも最終更新日時は保持する。
5. **最終確認日表示**
   - 個体ごとに「最終確認日（YYYY-MM-DD）」を表示する。
  - 表示と保存値のタイムゾーンはローカル時刻に統一する。
6. **データを真実源泉にする**
  - 判定ロジックと説明文は `transfer-routes` 等のデータ定義を唯一の真実源泉にする。
  - UI側で条件文や説明文をハードコードしない。

## 固定意思決定

- 不可逆フローは既存画面へ散在させず、専用確認導線で実装する。
- 2段階確認の第2段階は「実行ボタン直前の最終同意」で固定する。
- OR条件判定はロジック層で一元化し、UIで再実装しない。
- missed手動変更は常時可能。隠し条件は設けない。
- 最終確認日はクライアント保存を第一選択にする（SSG/PWA前提）。
- 判定・文言はデータ定義から生成/参照し、重複定義を禁止する。

## 高優先変更ファイル一覧

1. `src/lib/data/transfer-routes.ts`（OR条件を含む転送要件/説明文の真実源泉）
2. `src/lib/stores/setup.svelte.ts`（所持ハード情報の正規化と参照）
3. `src/lib/utils/ribbonEligibility.ts`（判定ロジック一元化）
4. `src/lib/utils/ribbonEligibility.test.ts`（OR条件・境界ケースのテスト）
5. `src/routes/guide/+page.svelte`（データ由来の説明表示）
6. `src/lib/components/roadmap/TransferArrow.svelte`（転送可否/代替手段の表示）
7. `src/lib/components/tracker/RibbonCard.svelte`（missed手動変更と最終確認日表示）
8. `src/app.css`（不可逆警告/確認UIの共通スタイル）
9. `src/lib/stores/ribbonProgress.svelte.ts`（確認状態・最終確認日の保持）

## Phase A〜E

### Phase A: データ・型の土台を固定

**目的**
- 転送要件・説明文・OR代替条件をデータ定義へ集約し、ストアが参照可能な状態にする。

**実装タスク**
- `transfer-routes.ts` にハード要件/手段のOR条件と説明文を定義。
- `setup.svelte.ts` でハード情報を判定可能な形式に正規化。
- `ribbonProgress.svelte.ts` で確認状態・最終確認日を保持。

**完了チェック**
- `npm run check` が通る。
- データ未設定時でも判定が壊れない。
- 最終確認日が個体単位で保存・読込できる。

### Phase B: 判定ロジックの単一化

**目的**
- 不可逆判定とOR代替手段判定をロジック層へ集約し、UI差分で挙動がズレないようにする。

**実装タスク**
- `ribbonEligibility.ts` に「ハード要件OR条件」の判定を追加。
- 判定結果に対応する説明文キーを返し、文言はデータから解決。
- UI内の重複判定分岐を削除。

**完了チェック**
- `ribbonEligibility.test.ts` で OR（A/B）・非充足・複数手段成立を網羅。
- 判定ロジックが UI コンポーネントで再計算されていない。

### Phase C: 2段階確認UIの導入

**目的**
- ユーザーに不可逆性を誤解させない確認フローを導入する。

**実装タスク**
- `TransferArrow.svelte` を中心に2段階確認導線を追加。
- 第1段階: 注意喚起 + 条件確認。
- 第2段階: 最終確認（不可逆同意）+ 実行。
- 実行完了時に最終確認日を更新。

**完了チェック**
- 1段階目のみでは実行できない。
- 2段階目を完了した場合のみ実行される。
- 実行後に最終確認日が画面へ即時反映される。

### Phase D: missed手動変更の操作性統一

**目的**
- missed 手動変更と最終確認日表示を主要導線で一貫させる。

**実装タスク**
- `RibbonCard.svelte` で missed 手動変更操作を提供。
- 変更時の表示文言はデータ由来文言に統一。
- 最終確認日の表示位置と更新条件を明確化。

**完了チェック**
- missed 変更が保存され、再読込後も維持される。
- 表示文言が判定結果と矛盾しない。
- 変更内容がストアへ正しく保存される。

### Phase E: ルート統合と仕上げ

**目的**
- ガイドと主要導線で同一ルール・同一文言を提供する。

**実装タスク**
- `routes/guide/+page.svelte` へデータ由来の要件説明を統合。
- `app.css` で不可逆警告・確認UIの見た目を統一。
- lint/check/test で最終検証。

**完了チェック**
- guideと実操作UIで説明/判定の不一致がない。
- `npm run lint` / `npm run check` / `npm run test` が通る。
- リグレッションがないことを手動確認できる。

## セッション再開チェックリスト

再開時は以下を上から順に確認する。

1. 直近の作業ログに「実装済み/未実装」が明記されている。
2. 現在フェーズ（A〜E）が特定できる。
3. 非交渉要件6点に対し、未達がどれか判別できる。
4. 変更対象ファイルが高優先一覧に沿っている。
5. 直近の `npm run lint` / `npm run check` / `npm run test` 結果が残っている。
6. 途中状態のUI（2段階確認）が壊れていない。

## 作業ログテンプレート

以下テンプレートをそのまま使用する。

```md
### YYYY-MM-DD HH:mm セッション記録
- 担当フェーズ: Phase [A|B|C|D|E]
- 目的: 
- 変更ファイル:
  - 
- 実装内容（要点3行以内）:
  - 
- 検証結果:
  - lint: pass/fail
  - check: pass/fail
  - test: pass/fail
- 未完了タスク:
  - 
- 次セッション開始手順（最短3ステップ）:
  1. 
  2. 
  3. 
- 懸念・リスク:
  - 
```

### 2026-03-03 UX改善フェーズG セッション記録
- 担当フェーズ: UX改善 G
- 目的: ロードマップ折りたたみ改善、バナー/ヒント永続化、confirm廃止、長押し情報表示、ガイド一括操作
- 変更ファイル:
  - `src/lib/components/roadmap/RoadmapStep.svelte`
  - `src/lib/components/roadmap/RoadmapView.svelte`
  - `src/routes/quick/+page.svelte`
  - `src/routes/+page.svelte`
  - `src/lib/components/tracker/QuickCheck.svelte`
  - `src/routes/guide/+page.svelte`
  - `src/lib/components/tracker/RibbonCard.svelte`
- 実装内容（要点3行以内）:
  - currentフェーズのトグル制限削除・ロードマップ未選択バナーをシンプル化・`confirm()`廃止。
  - クイック説明バナーとスワイプヒントに×/自動dismissを追加しlocalStorageで永続化。
  - グリッドカードに600ms長押しToast（状態ラベル＋理由）追加、ガイドに全展開/全折りたたみボタン追加。
- 検証結果:
  - lint: pass
  - check: 0 errors 0 warnings
  - test: 12/12 pass
- 未完了タスク: なし（このフェーズの範囲は完了）
- 次セッション開始手順（最短3ステップ）:
  1. 本ドキュメントの「現在の進捗」を確認
  2. `npm run lint && npm run check && npm run test` 実行して全グリーン確認
  3. G-1（ガイドリボン検索）またはPhase 6（PWA + Gen9データ整備）から着手
- 懸念・リスク:
  - 長押しと通常タップが競合する可能性（600ms後pointerupでclickもfireしてチェックが切り替わる）
  - G-1はsearchQuery + $derivedフィルタリング実装が必要（中程度の変更量）

---

### 2026-03-03 UX改善フェーズF セッション記録
- 担当フェーズ: UX改善 F（Phase A〜Eの外の追加UX改善）
- 目的: モバイルでのリボン視認性、初回オンボーディング、確認UIの適切な重み、クイックチェックの実用性向上
- 変更ファイル:
  - `src/lib/components/tracker/RibbonCard.svelte`
  - `src/lib/components/roadmap/RoadmapStep.svelte`
  - `src/lib/components/roadmap/TransferArrow.svelte`
  - `src/lib/components/tracker/QuickCheck.svelte`
  - `src/routes/+page.svelte`
  - `src/routes/setup/+page.svelte`
- 実装内容（要点3行以内）:
  - グリッドのモバイル視認性を解消（リボン名常時表示・ロードマップグリッド化）。
  - 不可逆確認UIを取り返しのつかない操作に見合うサイズ・重みに変更、確認済み状態の視覚化追加。
  - クイックチェックをブロック廃止→参照モード対応、urgent/missed優先ソートと状態バッジ追加。
- 検証結果:
  - lint: pass
  - check: 0 errors 0 warnings
  - test: 12/12 pass
- 未完了タスク: なし（このフェーズの範囲は完了）
- 次セッション開始手順（最短3ステップ）:
  1. 本ドキュメントの「現在の進捗」を確認（全フェーズ✅）
  2. `npm run lint && npm run check && npm run test` 実行して全グリーン確認
  3. 次はPhase 6（PWA + Gen9データ整備）、または追加UX課題から着手
- 懸念・リスク:
  - 残UX課題: R-1（ロードマップcurrentフェーズ折りたたみ不可）、G-1（ガイドリボン検索）など中優先が残っている
  - Gen9データ整備は内容確認が必要（SV DLC追加リボン等）

---

### 2026-03-03 23:59 セッション記録
- 担当フェーズ: Phase E
- 目的: 不可逆転送UI刷新の仕上げと、参照モード/記録モード導線の明確化
- 変更ファイル:
  - `src/lib/components/roadmap/RoadmapView.svelte`
  - `src/lib/components/roadmap/TransferArrow.svelte`
  - `src/routes/guide/+page.svelte`
  - `src/routes/+page.svelte`
  - `src/routes/quick/+page.svelte`
  - `README.md`
  - `docs/rewrite-plan.md`
  - `docs/irreversible-transfer-ux-handoff.md`
  - `CLAUDE.md`
- 実装内容（要点3行以内）:
  - ロードマップに不可逆転送セーフティダッシュボードを追加。
  - ガイド転送タブを不可逆優先の視認設計に刷新。
  - トラッカー/ロードマップ/クイックで参照モードと記録モードの違いを明示。
- 検証結果:
  - lint: pass
  - check: pass
  - test: pass
- 未完了タスク:
  - 実機での文言トーン最終調整（必要なら）
- 次セッション開始手順（最短3ステップ）:
  1. 本ドキュメントの「現在の進捗」を確認
  2. `/roadmap` と `/guide` の実画面を目視確認
  3. 必要なら文言と配色のみ微調整して再検証
- 懸念・リスク:
  - 大きな機能リスクは解消済み。残りは体験品質のチューニング中心。

## 実装前懸念レジスタ

> 記録日: 2026-03-03（コードレビュー＋スマホUXレビューより抽出）
> ステータス凡例: 🔴 未着手 / 🟡 対応中 / ✅ 解決済み

### P0 — すぐ着手すべき（誤操作・アクセシビリティ・仕様矛盾）

| # | severity | category | ファイル | 問題 | 提案 | ステータス |
|---|----------|----------|---------|------|------|-----------|
| 1 | High | mobile-ux | `src/lib/components/tracker/QuickCheck.svelte` | `onTouchEnd` でスワイプ成立しても `onclick` が引き続き発火し、意図しないリボントグルが起きる（競合確認済み: L103〜L119） | スワイプ移動量フラグを立て、`toggleCurrent` の冒頭で抑止。`pointer` イベントへの統一も検討 | ✅ |
| 2 | High | a11y | `src/routes/+page.svelte` | モバイルボトムシートが `div` 実装でフォーカストラップ・`aria-modal`・開閉時のフォーカス復帰が未実装 | `<dialog>` 相当に寄せ、開閉時に適切なフォーカス制御を追加 | ✅ |
| 3 | High | mobile-ux | `src/routes/+layout.svelte`, `src/lib/components/ui/Toast.svelte`, `src/routes/+page.svelte` | 下部固定ナビ（`z-50`）＋右下トースト（`bottom-4 right-4 z-50`）＋画面下固定パネルが同時出現し操作領域が競合 | トーストをモバイルで上寄せ（`top-4`）に切り替えるか、safe-area込みのオフセットをapp.cssに共通化 | ✅ |
| 4 | High | feature | `src/lib/data/ribbons-gen9.ts` | `master-ribbon`（マスターリボン）が通常リボンと同構造で手動トグル可能。全リボン取得で自動付与されるべき実績なので仕様矛盾 | 派生実績（他リボン全取得で自動算出）として扱い手動チェック不可に。要仕様確定 | ✅ |

### P1 — 体験品質の安定化

| # | severity | category | ファイル | 問題 | 提案 | ステータス |
|---|----------|----------|---------|------|------|-----------|
| 5 | Med | mobile-ux | `src/lib/components/tracker/QuickCheck.svelte` | `h-[calc(100vh-5rem)]` はモバイルブラウザのアドレスバー展開/縮小で高さがズレる | `100dvh` 系に置換（例: `h-[calc(100dvh-5rem)]`） | ✅ |
| 6 | Med | perf | `src/routes/+page.svelte`, `src/lib/stores/ribbonProgress.svelte.ts` | `includes` を多用したフィルタと状態別Mapが毎回再構築され、ポケモン数・リボン数増加で線形コスト増 | `$derived` で `checkedSet`（`Set<string>`）を事前計算し、全参照箇所を `.has()` に置換 | ✅ |
| 7 | Med | a11y | `src/lib/components/tracker/MyPokemonPanel.svelte` | カード選択が `div role="button"` で Enter のみ対応、Space 操作と `aria-pressed` による選択状態通知が弱い | 実ボタン化または Space キーハンドラ追加、`aria-pressed` で選択状態を公開 | ✅ |
| 8 | Med | a11y | `src/lib/components/tracker/RibbonCard.svelte` | 状態理由がホバー時ツールチップ中心で、タッチデバイスとキーボード操作では情報到達性が低い | `urgent`/`missed` など重要な理由は常設のサブテキストで表示、ツールチップは補足扱いへ | ✅ |

### P2 — 中長期改善

| # | severity | category | ファイル | 問題 | 提案 | ステータス |
|---|----------|----------|---------|------|------|-----------|
| 9 | Med | code | `src/lib/stores/ribbonProgress.svelte.ts` | `importProgress` で `myPokemonList` の構造バリデーションが最小限で、破損データ耐性が低い | ランタイムで必須キー・型を検証し、不正データは部分復元または警告表示に倒す | ✅ |
| 10 | Low | mobile-ux | `src/lib/components/tracker/PokemonSearch.svelte` | 部分一致のみで正規化なし、カタカナ/ひらがな揺れや大文字小文字の違いで検索漏れが発生 | 入力側とデータ側を正規化（カタカナ統一・小文字化）してから比較 | ✅ |
| 11 | Low | perf | `src/routes/+page.svelte`, `src/routes/quick/+page.svelte`, `src/routes/roadmap/+page.svelte` | 各ページで `init()` を都度呼ぶ構成で、同一データの再初期化が起きやすい | 初期化済みフラグをストアに持ち、呼び出し側でガードする | ✅ |
| 12 | Low | mobile-ux | `src/app.css`, `src/routes/+layout.svelte` | `env(safe-area-inset-*)` の使用が散在または未適用で、ノッチ機種での操作エリア食い込みリスク | safe-area トークンを `app.css` の `@theme {}` に共通化 | ✅ |

---

## 不要画像整理 — 2026-03-03 実施記録

### 削除対象（ルート直下 PNG 8件、参照0件を確認済み）

| ファイル | 判定理由 |
|---------|---------|
| `roadmap-padding.png` | コード内参照なし、調査時スクリーンショットと推定 |
| `tracker-desktop.png` | コード内参照なし、調査時スクリーンショットと推定 |
| `roadmap-transfer-arrow.png` | コード内参照なし、調査時スクリーンショットと推定 |
| `roadmap-grid.png` | コード内参照なし、調査時スクリーンショットと推定 |
| `guide-transfer-refresh-actual.png` | コード内参照なし、調査時スクリーンショットと推定 |
| `roadmap-refresh.png` | コード内参照なし、調査時スクリーンショットと推定 |
| `guide-transfer-refresh.png` | コード内参照なし、調査時スクリーンショットと推定 |
| `setup-page.png` | コード内参照なし、調査時スクリーンショットと推定 |

### 保持対象

| ファイル | 保持理由 |
|---------|---------|
| `static/favicon.ico` | `src/app.html`（L7）・`vite.config.ts`（L12）で参照、PWAアイコンとして必須 |
| `static/apple-touch-icon.png` | `src/app.html`（L8）・`vite.config.ts`（L12）で参照、iOS PWAアイコンとして必須 |
| `src/lib/assets/favicon.svg` | 今回スコープ外（参照なしだが将来利用の可能性あり、次回整理時に再判断） |

---

## 反映漏れ防止ルール

1. 要件ごとに「実装箇所」と「確認箇所」を1対1で対応表にする。
2. UI修正時は必ずロジック層の再利用有無を確認し、重複実装を禁止する。
3. フェーズ完了時に、次フェーズへ進む前に lint/check/test を必ず実行する。
4. 仕様変更が出た場合、まず本ドキュメントの「非交渉要件」または「固定意思決定」を更新してから実装する。
5. 迷った実装は暫定で進めず、作業ログに「判断待ち」として明示する。

---

運用メモ: 本書は「再開優先ドキュメント」。詳細仕様が散在した場合は本書へ集約し、READMEのリンク導線を常に有効に保つ。
