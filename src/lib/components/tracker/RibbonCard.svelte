<script lang="ts">
	import type { Ribbon, RibbonState } from '$lib/types';
	import { getGameName } from '$lib/utils/gameNames';
	import { toast } from '$lib/stores/toast.svelte';

	/** カテゴリカラーマップ */
	const CATEGORY_STYLE: Record<string, { bg: string; label: string }> = {
		'チャンピオン': { bg: 'bg-amber-500',  label: '🏆' },
		'コンテスト':   { bg: 'bg-pink-500',   label: '🎭' },
		'バトル施設':   { bg: 'bg-red-500',    label: '⚔️' },
		'思い出':       { bg: 'bg-cyan-500',   label: '💫' },
		'イベント':     { bg: 'bg-violet-500', label: '✨' },
		'特殊':         { bg: 'bg-green-500',  label: '🌟' },
	};

	/** Props */
	let {
		ribbon,
		ribbonState,
		onToggle,
    reasonLabels = [],
    onToggleManualMissed,
    isManualMissed = false,
    manualMissedUpdatedAt,
		view = 'grid'
	}: {
		ribbon: Ribbon;
		ribbonState: RibbonState;
		onToggle: () => void;
      reasonLabels?: string[];
      onToggleManualMissed?: () => void;
      isManualMissed?: boolean;
      manualMissedUpdatedAt?: string;
		view?: 'list' | 'grid';
	} = $props();

	const isObtained = $derived(ribbonState === 'obtained');
	const isDisabled = $derived(ribbonState === 'future' || ribbonState === 'locked');
  const canManualEditMissed = $derived(ribbonState !== 'future' && ribbonState !== 'locked');

	/** カテゴリスタイル解決 */
	const style = $derived(
		ribbon.type === 'mark'
			? { label: '🔖', bg: 'bg-purple-400' }
			: (CATEGORY_STYLE[ribbon.category] ?? { label: '🎀', bg: 'bg-blue-400' })
	);

	/** アコーディオン展開状態（リストモード用） */
	let isExpanded = $state(false);

	/** リボン取得アニメーション状態 */
	let justCollected = $state(false);

	/** レベル制限リボンかどうか */
	const isLevelRestricted = $derived(ribbon.eligibility?.type === 'level_max');

	/** 世代テキスト */
	const generationText = $derived(`第${ribbon.generation}世代`);

	/** 対応ゲーム名一覧 */
	const gameNames = $derived(ribbon.games.map(getGameName));

	/** グリッドビュー用状態別クラス */
	const gridButtonClass = $derived((): string => {
		switch (ribbonState) {
			case 'obtained':  return `${style.bg} text-white ring-2 ring-offset-1 shadow-md`;
			case 'urgent':    return 'bg-orange-400 text-white animate-pulse';
			case 'available': return 'bg-gray-200 text-gray-400 hover:bg-gray-300';
			case 'future':    return 'bg-gray-100 text-gray-300 opacity-50';
			case 'missed':    return 'bg-red-100 text-red-400 opacity-80';
			case 'locked':    return 'bg-gray-100 text-gray-200 opacity-25';
			default:          return 'bg-gray-200 text-gray-400';
		}
	});

	/** グリッドビュー用状態ラベル */
	const gridStateLabel = $derived((): string => {
		switch (ribbonState) {
			case 'urgent': return '⚡ 今すぐ！';
			case 'missed': return '❌ 取り逃し';
			case 'locked': return '🚫 取得不可';
			case 'future': return '🔒 未来';
			default:       return '';
		}
	});

	/** リストビュー用外側divクラス */
	const listWrapperClass = $derived((): string => {
		switch (ribbonState) {
			case 'obtained':  return 'border-green-200 bg-green-50';
			case 'urgent':    return 'border-orange-300 bg-orange-50 border-l-4 border-l-orange-400';
			case 'available': return 'border-gray-200 bg-white';
			case 'future':    return 'border-gray-100 bg-gray-50 opacity-60';
			case 'missed':    return 'border-red-200 bg-red-50 border-l-4 border-l-red-400';
			case 'locked':    return 'border-gray-100 bg-white opacity-40';
			default:          return 'border-gray-200 bg-white';
		}
	});

	/** トグルハンドラ（グリッドモード用・アニメーション付き） */
	function handleToggle(): void {
		if (!isObtained) {
			justCollected = true;
			setTimeout(() => { justCollected = false; }, 400);
		}
		onToggle();
	}

	/** 状態ラベル（長押しToast用） */
	function getStateLabel(state: RibbonState): string {
		switch (state) {
			case 'urgent':    return '⚡ 今すぐ取得必須！';
			case 'missed':    return '❌ 取り逃し';
			case 'locked':    return '🔒 取得不可';
			case 'obtained':  return '✅ 取得済み';
			case 'available': return '🎯 取得可能';
			case 'future':    return '🔜 将来のリボン';
			default:          return '';
		}
	}

	/** 長押しタイマー（グリッドモード用） */
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	const LONG_PRESS_DURATION = 600;

	function onGridPointerDown(): void {
		longPressTimer = setTimeout(() => {
			const stateLabel = getStateLabel(ribbonState);
			const reason = reasonLabels.length > 0 ? ` — ${reasonLabels[0]}` : '';
			toast.show(`${ribbon.name}: ${stateLabel}${reason}`);
			longPressTimer = null;
		}, LONG_PRESS_DURATION);
	}

	function onGridPointerUp(): void {
		if (longPressTimer !== null) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}
</script>

{#if view === 'grid'}
  <!-- グリッドビュー: 丸いバッジボタン + リボン名ラベル -->
  <div class="flex flex-col items-center gap-1">
    <button
      class="group relative h-14 w-14 rounded-full transition-all duration-200
        {gridButtonClass()}
        {justCollected ? 'ribbon-collect' : ''}"
      onclick={handleToggle}
      onpointerdown={onGridPointerDown}
      onpointerup={onGridPointerUp}
      onpointercancel={onGridPointerUp}
      onpointerleave={onGridPointerUp}
      disabled={isDisabled}
      aria-label="{ribbon.name} {isObtained ? '取得済み' : '未取得'}"
    >
      <span class="text-xl">{style.label}</span>
      <!-- デスクトップ用ホバーツールチップ（状態ラベル＋理由） -->
      <div class="absolute bottom-full left-1/2 z-10 mb-1 hidden w-max max-w-48 -translate-x-1/2
                  rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
        {#if reasonLabels.length > 0}
          <span class="block text-left text-[10px] text-gray-200">{reasonLabels[0]}</span>
        {/if}
        {#if gridStateLabel()}
          <span class="block text-yellow-300 text-xs">{gridStateLabel()}</span>
        {/if}
      </div>
    </button>
    <!-- モバイル含む常時表示リボン名 -->
    <span
      class="block w-14 truncate text-center text-[9px] leading-tight
        {isObtained ? 'text-green-700 font-medium' : ribbonState === 'urgent' ? 'text-orange-600 font-medium' : ribbonState === 'missed' ? 'text-red-500' : 'text-gray-500'}"
      title={ribbon.name}
    >{ribbon.name}</span>
  </div>
{:else}
  <!-- リストビュー: 既存のアコーディオンUI -->
  <div
    class="rounded-lg border transition-colors {listWrapperClass()}"
  >
    <!-- カードヘッダー（常時表示） -->
    <div class="flex items-center gap-2 p-3">
      <!-- チェックボックス -->
      <button
        class="flex-shrink-0"
        onclick={onToggle}
        disabled={isDisabled}
        aria-label={isObtained ? 'リボン取得済み（クリックで解除）' : 'リボン未取得（クリックで取得済みにする）'}
      >
        <span
          class="flex h-6 w-6 items-center justify-center rounded border-2 text-sm
            {isObtained
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-gray-300 bg-white text-transparent'}"
        >
          ✓
        </span>
      </button>

      <!-- リボン情報 -->
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5">
          <!-- リボン名 -->
          <span class="text-sm font-medium {isObtained ? 'text-green-800' : 'text-gray-900'}">
            {ribbon.name}
          </span>

          <!-- 状態バッジ -->
          {#if ribbonState === 'urgent'}
            <span class="rounded-full bg-orange-500 px-1.5 py-0.5 text-xs font-bold text-white">⚡ 今すぐ！</span>
          {:else if ribbonState === 'missed'}
            <span class="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">❌ 取り逃し</span>
          {:else if ribbonState === 'locked'}
            <span class="rounded-full bg-gray-400 px-1.5 py-0.5 text-xs text-white">🚫 取得不可</span>
          {:else if ribbonState === 'future'}
            <span class="rounded-full bg-gray-300 px-1.5 py-0.5 text-xs text-gray-600">🔒 未来</span>
          {/if}

          <!-- カテゴリタグ -->
          <span class="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
            {ribbon.category}
          </span>

          <!-- 世代タグ -->
          <span class="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            {generationText}
          </span>

          <!-- レベル制限警告タグ -->
          {#if isLevelRestricted}
            <span class="rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
              ⚠ Lv.{ribbon.eligibility?.maxLevel}以下
            </span>
          {/if}

          <!-- あかしタグ -->
          {#if ribbon.type === 'mark'}
            <span class="rounded-full bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
              あかし
            </span>
          {/if}
        </div>
      </div>

      <!-- 展開トグルボタン -->
      <button
        class="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        onclick={() => (isExpanded = !isExpanded)}
        aria-label={isExpanded ? '詳細を閉じる' : '詳細を開く'}
      >
        <span class="text-xs">{isExpanded ? '▲' : '▼'}</span>
      </button>
    </div>

    <!-- アコーディオン展開エリア -->
    {#if isExpanded}
      <div class="border-t border-gray-100 px-3 pb-3 pt-2">
      {#if reasonLabels.length > 0}
        <div class="mb-2 rounded bg-gray-50 p-2">
          <p class="mb-1 text-xs font-medium text-gray-700">判定理由</p>
          <ul class="space-y-0.5">
            {#each reasonLabels as label (label)}
              <li class="text-xs text-gray-600">• {label}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if canManualEditMissed && onToggleManualMissed}
        <div class="mb-2 rounded border border-red-200 bg-red-50 p-2">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-medium text-red-700">取り逃し状態を手動変更</p>
            <button
              class="rounded px-2 py-1 text-xs font-semibold text-white {isManualMissed ? 'bg-gray-500' : 'bg-red-600'}"
              onclick={onToggleManualMissed}
            >
              {isManualMissed ? '取り逃し解除' : '取り逃しにする'}
            </button>
          </div>
          {#if manualMissedUpdatedAt}
            <p class="mt-1 text-[11px] text-red-600">最終更新日: {manualMissedUpdatedAt}</p>
          {/if}
        </div>
      {/if}

        <!-- 説明文 -->
        {#if ribbon.description}
          <p class="mb-2 text-xs text-gray-600">{ribbon.description}</p>
        {/if}

        <!-- 取得条件 -->
        {#if ribbon.requirements}
          <div class="mb-2">
            <p class="mb-0.5 text-xs font-medium text-gray-700">取得条件</p>
            <p class="text-xs text-gray-600">{ribbon.requirements}</p>
          </div>
        {/if}

        <!-- 対応ゲーム -->
        {#if gameNames.length > 0}
          <div>
            <p class="mb-1 text-xs font-medium text-gray-700">対応ゲーム</p>
            <div class="flex flex-wrap gap-1">
              {#each gameNames as name (name)}
                <span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                  {name}
                </span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}
