<script lang="ts">
	import type { Ribbon } from '$lib/types';
	import { getGameName } from '$lib/utils/gameNames';

	/** Props */
	let {
		ribbon,
		isObtained,
		eligibility,
		onToggle
	}: {
		ribbon: Ribbon;
		isObtained: boolean;
		eligibility: { eligible: boolean; reason?: string };
		onToggle: () => void;
	} = $props();

	/** アコーディオン展開状態 */
	let isExpanded = $state(false);

	/** レベル制限リボンかどうか */
	const isLevelRestricted = $derived(ribbon.eligibility?.type === 'level_max');

	/** 取得不可かどうか */
	const isIneligible = $derived(!eligibility.eligible);

	/** 世代テキスト */
	const generationText = $derived(`第${ribbon.generation}世代`);

	/** 対応ゲーム名一覧 */
	const gameNames = $derived(ribbon.games.map(getGameName));
</script>

<div
	class="rounded-lg border transition-colors
		{isObtained ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}
		{isIneligible ? 'opacity-50' : ''}"
>
	<!-- カードヘッダー（常時表示） -->
	<div class="flex items-center gap-2 p-3">
		<!-- チェックボックス -->
		<button
			class="flex-shrink-0"
			onclick={onToggle}
			disabled={isIneligible}
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

			<!-- 取得不可の理由 -->
			{#if isIneligible && eligibility.reason}
				<p class="mt-0.5 text-xs text-red-600">{eligibility.reason}</p>
			{/if}
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
