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
		onToggle: (ribbonId: string) => void;
	} = $props();

	let isOpen = $state(true);
	let isLockedOpen = $state(false);

	const completionPercent: number = $derived(
		genProgress && genProgress.total > 0
			? Math.round((genProgress.obtained / genProgress.total) * 100)
			: 0
	);

	const totalInGroup: number = $derived(
		group.ribbons.length + group.urgentRibbons.length + group.lockedRibbons.length
	);
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
	<!-- 世代ヘッダー -->
	<button
		class="flex w-full items-center justify-between rounded-t-lg px-4 py-3 hover:bg-gray-50"
		onclick={() => (isOpen = !isOpen)}
	>
		<div class="flex items-center gap-3">
			<h2 class="text-base font-bold text-gray-900">第{group.generation}世代</h2>
			{#if group.urgentRibbons.length > 0}
				<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
					⚠ 緊急 {group.urgentRibbons.length}個
				</span>
			{/if}
			{#if group.lockedRibbons.length > 0}
				<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
					🔒 {group.lockedRibbons.length}個
				</span>
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
			<span class="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
		</div>
	</button>

	<!-- プログレスバー -->
	{#if genProgress}
		<div class="h-1.5 w-full bg-gray-100">
			<div
				class="h-full bg-green-500 transition-all"
				style="width: {completionPercent}%"
			></div>
		</div>
	{/if}

	<!-- 折りたたみコンテンツ -->
	{#if isOpen}
		<div class="px-4 py-3">
			<!-- 緊急リボン -->
			{#if group.urgentRibbons.length > 0}
				<div class="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
					<div class="mb-2 flex items-center gap-1.5">
						<span class="text-sm font-bold text-red-800">⚠ レベルが上がる前に取得必須！</span>
					</div>
					<div class="flex flex-col gap-2">
						{#each group.urgentRibbons as ribbon (ribbon.id)}
							<RibbonCard
								{ribbon}
								isObtained={ribbonProgress.currentCheckedRibbons.includes(ribbon.id)}
								eligibility={ribbonProgress.getRibbonEligibility(ribbon)}
								onToggle={() => onToggle(ribbon.id)}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<!-- 通常リボン -->
			{#if group.ribbons.length > 0}
				<div class="flex flex-col gap-2">
					{#each group.ribbons as ribbon (ribbon.id)}
						<RibbonCard
							{ribbon}
							isObtained={ribbonProgress.currentCheckedRibbons.includes(ribbon.id)}
							eligibility={ribbonProgress.getRibbonEligibility(ribbon)}
							onToggle={() => onToggle(ribbon.id)}
						/>
					{/each}
				</div>
			{:else if group.urgentRibbons.length === 0}
				<p class="text-center text-sm text-gray-400">この世代のリボンはありません</p>
			{/if}

			<!-- ロックリボン -->
			{#if group.lockedRibbons.length > 0}
				<div class="mt-3">
					<button
						class="flex w-full items-center gap-1.5 rounded-md bg-gray-50 px-3 py-2 text-left hover:bg-gray-100"
						onclick={() => (isLockedOpen = !isLockedOpen)}
					>
						<span class="text-sm text-gray-500">
							🔒 未所持ゲームのリボン（{group.lockedRibbons.length}個）
						</span>
						<span class="ml-auto text-xs text-gray-400">{isLockedOpen ? '▲' : '▼'}</span>
					</button>
					{#if isLockedOpen}
						<div class="mt-2 flex flex-col gap-2">
							{#each group.lockedRibbons as ribbon (ribbon.id)}
								<div class="opacity-50">
									<RibbonCard
										{ribbon}
										isObtained={false}
										eligibility={{ eligible: false, reason: '未所持ゲームのリボン' }}
										onToggle={() => {}}
									/>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
