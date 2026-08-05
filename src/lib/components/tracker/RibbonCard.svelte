<script lang="ts">
	import type { Ribbon, RibbonState } from '$lib/types';
	import { getGameName } from '$lib/utils/gameNames';
	import { toast } from '$lib/stores/toast.svelte';
	import RibbonIcon from '$lib/components/ui/RibbonIcon.svelte';
	import { getCategoryStyle } from '$lib/utils/ribbonCategory';
	import {
		getListWrapperClass,
		getRibbonStateStyle,
		getStateBadge,
		getStateLabel
	} from '$lib/utils/ribbonStateStyle';

	/** Props */
	let {
		ribbon,
		ribbonState,
		onToggle,
		reasonLabels = [],
		onToggleManualMissed,
		isManualMissed = false,
		manualMissedUpdatedAt,
		view = 'grid',
		showGeneration = false
	}: {
		ribbon: Ribbon;
		ribbonState: RibbonState;
		onToggle: () => void;
		reasonLabels?: string[];
		onToggleManualMissed?: () => void;
		isManualMissed?: boolean;
		manualMissedUpdatedAt?: string;
		view?: 'list' | 'grid';
		/**
		 * 世代バッジを行に出すか。
		 * ロードマップでは見出しが世代を持っているので出さない（既定）。
		 * /box のように行だけを見る画面では true を渡す。
		 */
		showGeneration?: boolean;
	} = $props();

	const isObtained = $derived(ribbonState === 'obtained');
	const isDisabled = $derived(ribbonState === 'future' || ribbonState === 'locked');
	const canManualEditMissed = $derived(ribbonState !== 'future' && ribbonState !== 'locked');

	/** カテゴリ表示定義（絵文字フォールバック＋外周リング色） */
	const category = $derived(getCategoryStyle(ribbon));

	/** 状態 → 表現の対応表 */
	const stateStyle = $derived(getRibbonStateStyle(ribbonState));

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

	/** リスト行の状態バッジ（3階層のうち「状態＝ベタ塗り」） */
	const stateBadge = $derived(getStateBadge(ribbonState));

	/**
	 * 理由文を行に出すか。
	 * 条件バッジ（⚠ Lv.n以下）がある場合は同じことを二重に言うことになるので出さない。
	 * 条件バッジがない missed などは、理由が一番重い情報なので行に残す。
	 */
	const showInlineReason = $derived(
		!isLevelRestricted &&
			(ribbonState === 'urgent' || ribbonState === 'missed') &&
			reasonLabels.length > 0
	);

	/** 取得アニメーションの長さ（app.css の .ribbon-collect と揃える） */
	const COLLECT_ANIMATION_DURATION = 400;

	/** トグルハンドラ（グリッドモード用・アニメーション付き） */
	function handleToggle(): void {
		if (!isObtained) {
			justCollected = true;
			setTimeout(() => {
				justCollected = false;
			}, COLLECT_ANIMATION_DURATION);
		}
		onToggle();
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
	<!--
		グリッドビュー: 丸いバッジボタン + リボン名ラベル
		塗り＝状態、外周リング＝カテゴリ。カテゴリ色はクラス名に載せられないので
		CSS 変数で渡す（Tailwind のパージ事故にも巻き込まれない）。
	-->
	<div class="group flex flex-col items-center gap-1.5" style="--ribbon-ring: {category.ring}">
		<div class="relative h-14 w-14">
			<button
				class="ribbon-cell {stateStyle.cellClass} {justCollected ? 'ribbon-collect' : ''}"
				onclick={handleToggle}
				onpointerdown={onGridPointerDown}
				onpointerup={onGridPointerUp}
				onpointercancel={onGridPointerUp}
				onpointerleave={onGridPointerUp}
				disabled={isDisabled}
				title={ribbon.name}
				aria-label="{ribbon.name} {isObtained ? '取得済み' : '未取得'}"
			>
				<RibbonIcon
					src={ribbon.image_url}
					alt={ribbon.name}
					sizeClass="h-8 w-8 text-xl"
					fallback={category.emoji}
				/>
				{#if stateStyle.strike}
					<span class="ribbon-cell__strike"></span>
				{/if}
			</button>

			<!-- 状態の記号（obtained の ✓ / urgent の ！）。点滅の代わりの静的な手がかり -->
			{#if stateStyle.chip}
				<span
					class="ribbon-cell__chip {stateStyle.chip.class}"
					role="img"
					aria-label={stateStyle.chip.label}>{stateStyle.chip.text}</span
				>
			{/if}

			<!-- デスクトップ用ホバーツールチップ（理由） -->
			{#if reasonLabels.length > 0}
				<div
					class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max max-w-48
						-translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-left text-[10px] text-gray-100
						group-hover:block"
				>
					{reasonLabels[0]}
				</div>
			{/if}
		</div>

		<!--
			リボン名。9px・1行 truncate では識別語が出る前に切れていたので、
			11px・2行まで（line-clamp）に広げた。正式名は title / aria-label に残している。
		-->
		<span
			class="line-clamp-2 w-full max-w-[76px] text-center text-[11px] leading-[1.35]
				{stateStyle.labelClass}"
			title={ribbon.name}>{ribbon.name}</span
		>
	</div>
{:else}
	<!-- リストビュー: アコーディオンUI -->
	<div class="rounded-lg border transition-colors {getListWrapperClass(ribbonState)}">
		<!-- カードヘッダー（常時表示） -->
		<div class="flex items-center gap-3 px-3 py-2.5">
			<!-- チェックボックス（タップ領域 44px、見た目 26px） -->
			<button
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg
					hover:bg-black/5 disabled:hover:bg-transparent"
				onclick={onToggle}
				disabled={isDisabled}
				aria-label={isObtained
					? 'リボン取得済み（クリックで解除）'
					: 'リボン未取得（クリックで取得済みにする）'}
			>
				<span
					class="flex h-6.5 w-6.5 items-center justify-center rounded-md border-2 text-sm
						{isObtained
						? 'border-state-obtained bg-state-obtained text-white'
						: 'border-gray-400 bg-white text-transparent'}"
				>
					✓
				</span>
			</button>

			<!--
				リボン情報。
				バッジは 状態＝ベタ塗り / 条件＝枠線のみ / 分類＝薄地 の3階層に分け、
				上段に名前と状態、下段に条件と分類を置く。
			-->
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<div class="flex flex-wrap items-center gap-2">
					<RibbonIcon
						src={ribbon.image_url}
						alt={ribbon.name}
						sizeClass="h-5 w-5"
						fallback={category.emoji}
					/>
					<span
						class="text-[15px] font-semibold {isObtained
							? 'text-state-obtained-text'
							: 'text-gray-900'}"
					>
						{ribbon.name}
					</span>

					<!-- 状態＝ベタ塗り。1行に必ず1個だけ -->
					{#if stateBadge}
						<span class="rounded-full px-2.5 py-0.5 text-xs font-bold {stateBadge.class}">
							{stateBadge.text}
						</span>
					{/if}
				</div>

				<div class="flex flex-wrap items-center gap-1.5">
					<!-- 条件＝枠線のみ。状態を説明する従属情報なので地を持たない -->
					{#if isLevelRestricted}
						<span
							class="rounded-full border border-orange-300 bg-white px-2 py-0.5 text-xs
								font-semibold text-state-urgent-text"
						>
							⚠ Lv.{ribbon.eligibility?.maxLevel}以下
						</span>
					{/if}

					<!-- 分類＝薄地。一番弱い。フィルタの手がかり用 -->
					<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
						{ribbon.category}
					</span>

					{#if showGeneration}
						<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
							{generationText}
						</span>
					{/if}

					<!-- 条件バッジと重ならない場合だけ、理由を行に残す -->
					{#if showInlineReason}
						<span class="text-xs text-gray-600">{reasonLabels[0]}</span>
					{/if}
				</div>
			</div>

			<!-- 展開トグルボタン（タップ領域 44px） -->
			<button
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs
					text-gray-500 hover:bg-black/5 hover:text-gray-900"
				onclick={() => (isExpanded = !isExpanded)}
				aria-expanded={isExpanded}
				aria-label={isExpanded ? '詳細を閉じる' : '詳細を開く'}
			>
				<span>{isExpanded ? '▲' : '▼'}</span>
			</button>
		</div>

		<!-- アコーディオン展開エリア -->
		{#if isExpanded}
			<div class="border-t border-gray-100 px-3 pt-2 pb-3">
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
								class="rounded px-2 py-1 text-xs font-semibold text-white {isManualMissed
									? 'bg-gray-500'
									: 'bg-red-600'}"
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

				<!-- 世代（行から落としたぶんをここで持つ） -->
				{#if !showGeneration}
					<div class="mb-2">
						<p class="mb-0.5 text-xs font-medium text-gray-700">世代</p>
						<p class="text-xs text-gray-600">{generationText}</p>
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
