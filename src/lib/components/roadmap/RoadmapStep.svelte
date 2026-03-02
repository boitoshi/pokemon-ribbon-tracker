<script lang="ts">
	import type { RibbonGroup } from '$lib/types';
	import type { GenerationProgress } from '$lib/stores/ribbonProgress.svelte';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import RibbonCard from '$lib/components/tracker/RibbonCard.svelte';

	let {
		group,
		genProgress,
		onToggle
	}: {
		group: RibbonGroup;
		genProgress: GenerationProgress | undefined;
		onToggle: (_ribbonId: string) => void;
	} = $props();

	// future だけデフォルト折りたたみ（current / past は展開）
	// group.phase はマウント時に安定するため、初期値として直接参照する
	let isOpen = $state(group.phase !== 'future');
	let isLockedOpen = $state(false);

	// current フェーズはトグル不可
	const canToggle = $derived(group.phase !== 'current');

	const completionPercent: number = $derived(
		genProgress && genProgress.total > 0
			? Math.round((genProgress.obtained / genProgress.total) * 100)
			: 0
	);

	const totalInGroup: number = $derived(
		group.ribbons.length +
			group.urgentRibbons.length +
			group.missedRibbons.length +
			group.futureRibbons.length +
			group.lockedRibbons.length
	);
</script>

<div
	class="rounded-lg border shadow-sm
  {group.phase === 'current'
		? 'border-blue-400 bg-blue-50'
		: group.phase === 'past'
			? 'border-gray-200 bg-gray-50'
			: 'border-dashed border-gray-300 bg-white'}"
>
	<!-- 世代ヘッダー -->
	<button
		class="flex w-full items-center justify-between rounded-t-lg px-4 py-3
      {canToggle ? 'hover:bg-black/5' : 'cursor-default'}"
		onclick={() => {
			if (canToggle) isOpen = !isOpen;
		}}
	>
		<div class="flex flex-wrap items-center gap-2">
			<h2 class="text-base font-bold text-gray-900">第{group.generation}世代</h2>

			<!-- current バッジ -->
			{#if group.phase === 'current'}
				<span class="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white"
					>🎯 今ここ！</span
				>
			{/if}

			<!-- 緊急バッジ -->
			{#if group.urgentRibbons.length > 0}
				<span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"
					>⚡ 緊急 {group.urgentRibbons.length}個</span
				>
			{/if}

			<!-- 取り逃しバッジ（past のみ） -->
			{#if group.phase === 'past' && group.missedRibbons.length > 0}
				<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
					>❌ {group.missedRibbons.length}個取り逃し</span
				>
			{/if}
		</div>

		<div class="flex items-center gap-3">
			{#if genProgress}
				<span class="text-sm text-gray-500">
					{genProgress.obtained}/{genProgress.total}
				</span>
			{:else}
				<span class="text-sm text-gray-400">{totalInGroup}個</span>
			{/if}
			{#if canToggle}
				<span class="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
			{/if}
		</div>
	</button>

	<!-- プログレスバー -->
	{#if genProgress}
		<div class="h-1.5 w-full bg-gray-100">
			<div class="h-full bg-green-500 transition-all" style="width: {completionPercent}%"></div>
		</div>
	{/if}

	<!-- 折りたたみコンテンツ -->
	{#if isOpen}
		<div class="px-4 py-3">
			<!-- 1. 緊急リボン -->
			{#if group.urgentRibbons.length > 0}
				<div class="mb-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
					<div class="mb-2 text-sm font-bold text-orange-800">⚡ 今すぐ取得必須！</div>
					<div class="flex flex-col gap-2">
						{#each group.urgentRibbons as ribbon (ribbon.id)}
							<RibbonCard
								{ribbon}
								ribbonState={ribbonProgress.getRibbonState(ribbon)}
								onToggle={() => onToggle(ribbon.id)}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<!-- 2. 通常リボン（available / obtained） -->
			{#if group.ribbons.length > 0}
				<div class="flex flex-col gap-2">
					{#each group.ribbons as ribbon (ribbon.id)}
						<RibbonCard
							{ribbon}
							ribbonState={ribbonProgress.getRibbonState(ribbon)}
							onToggle={() => onToggle(ribbon.id)}
						/>
					{/each}
				</div>
			{/if}

			<!-- 3. 取り逃しセクション（past フェーズのみ、デフォルト折りたたみ） -->
			{#if group.phase === 'past' && group.missedRibbons.length > 0}
				<details class="mt-2 rounded border border-red-200 bg-red-50">
					<summary class="cursor-pointer px-3 py-2 text-sm font-medium text-red-700">
						❌ 取り逃し（{group.missedRibbons.length}個）
					</summary>
					<p class="px-3 pb-1 text-xs text-red-500">
						この世代には戻れません。次の周回で取得してください。
					</p>
					<div class="flex flex-col gap-2 px-3 pb-3">
						{#each group.missedRibbons as ribbon (ribbon.id)}
							<RibbonCard
								{ribbon}
								ribbonState="missed"
								onToggle={() => onToggle(ribbon.id)}
							/>
						{/each}
					</div>
				</details>
			{/if}

			<!-- 4. ロックリボン（折りたたみ可能） -->
			{#if group.lockedRibbons.length > 0}
				<div class="mt-3">
					<button
						class="flex w-full items-center gap-1.5 rounded-md bg-gray-50 px-3 py-2 text-left hover:bg-gray-100"
						onclick={() => (isLockedOpen = !isLockedOpen)}
					>
						<span class="text-sm text-gray-500">
							🚫 取得不可のリボン（{group.lockedRibbons.length}個）
						</span>
						<span class="ml-auto text-xs text-gray-400">{isLockedOpen ? '▲' : '▼'}</span>
					</button>
					{#if isLockedOpen}
						<div class="mt-2 flex flex-col gap-2">
							{#each group.lockedRibbons as ribbon (ribbon.id)}
								<RibbonCard
									{ribbon}
									ribbonState="locked"
									onToggle={() => {}}
								/>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- 5. 空の場合 -->
			{#if group.ribbons.length === 0 && group.urgentRibbons.length === 0 && group.missedRibbons.length === 0}
				<p class="text-center text-sm text-gray-400">この世代のリボンはありません</p>
			{/if}
		</div>
	{/if}
</div>
