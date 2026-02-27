<script lang="ts">
	import type { FilterState } from '$lib/types';

	/** Props */
	let { onFilterChange }: { onFilterChange: (f: FilterState) => void } = $props();

	/** 世代リスト定数 */
	const GENERATIONS = [3, 4, 5, 6, 7, 8, 9] as const;

	/** リボンカテゴリ定義 */
	const RIBBON_TYPES: { id: string; name: string }[] = [
		{ id: 'champion', name: 'チャンピオン' },
		{ id: 'contest', name: 'コンテスト' },
		{ id: 'battle', name: 'バトル施設' },
		{ id: 'memory', name: '思い出' },
		{ id: 'event', name: 'イベント' },
		{ id: 'special', name: '特殊' },
		{ id: 'mark', name: 'あかし' }
	];

	/** フィルターパネルの開閉状態 */
	let isExpanded = $state(false);

	/** 検索クエリ */
	let searchQuery = $state('');

	/** アクティブなフィルター */
	let generation = $state<number | null>(null);
	let type = $state<string | null>(null);
	let status = $state<FilterState['status']>(null);

	/** アクティブなフィルター数 */
	const activeFilterCount = $derived(
		(generation !== null ? 1 : 0) + (type !== null ? 1 : 0) + (status !== null ? 1 : 0)
	);

	/** タイプIDから日本語名を取得する */
	function getRibbonTypeName(typeId: string): string {
		return RIBBON_TYPES.find((t) => t.id === typeId)?.name ?? typeId;
	}

	/** フィルター変更をコールバックで通知する */
	function emitFilterChange(): void {
		onFilterChange({ generation, type, status, search: searchQuery });
	}

	function toggleGeneration(gen: number | null): void {
		generation = generation === gen ? null : gen;
		emitFilterChange();
	}

	function toggleType(t: string | null): void {
		type = type === t ? null : t;
		emitFilterChange();
	}

	function toggleStatus(s: FilterState['status']): void {
		status = status === s ? null : s;
		emitFilterChange();
	}

	function handleSearchInput(): void {
		emitFilterChange();
	}

	function resetFilters(): void {
		generation = null;
		type = null;
		status = null;
		searchQuery = '';
		emitFilterChange();
	}
</script>

<div class="mb-2 md:mb-4">
	<!-- 検索バーとフィルタートグル（常時表示） -->
	<div class="flex items-center gap-2">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="リボンを検索..."
			oninput={handleSearchInput}
			class="flex-1 rounded-md border px-3 py-2 text-sm"
		/>
		<button
			class="flex items-center gap-1 rounded border px-3 py-2 text-sm
				{isExpanded
				? 'border-blue-500 bg-blue-500 text-white'
				: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
			onclick={() => (isExpanded = !isExpanded)}
		>
			フィルター
			{#if activeFilterCount > 0}
				<span
					class="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold
						{isExpanded ? 'bg-white text-blue-500' : 'bg-blue-500 text-white'}"
				>
					{activeFilterCount}
				</span>
			{/if}
			<span class="text-xs">{isExpanded ? '▲' : '▼'}</span>
		</button>
	</div>

	<!-- アクティブフィルターチップ（折りたたみ時に表示） -->
	{#if !isExpanded && activeFilterCount > 0}
		<div class="mt-1.5 flex flex-wrap gap-1">
			{#if generation !== null}
				<span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
					第{generation}世代
					<button class="hover:text-blue-500" onclick={() => toggleGeneration(null)}>×</button>
				</span>
			{/if}
			{#if type !== null}
				<span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
					{getRibbonTypeName(type)}
					<button class="hover:text-blue-500" onclick={() => toggleType(null)}>×</button>
				</span>
			{/if}
			{#if status !== null}
				<span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
					{status === 'obtained' ? '取得済み' : '未取得'}
					<button class="hover:text-blue-500" onclick={() => toggleStatus(null)}>×</button>
				</span>
			{/if}
		</div>
	{/if}

	<!-- 折りたたみフィルターパネル -->
	{#if isExpanded}
		<div class="mt-2 rounded-lg border bg-gray-50 p-3">
			<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
				<!-- 世代フィルター -->
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-700">世代</label>
					<div class="flex flex-wrap gap-1">
						<button
							class="rounded px-2 py-1 text-xs {generation === null ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
							onclick={() => toggleGeneration(null)}
						>
							すべて
						</button>
						{#each GENERATIONS as gen (gen)}
							<button
								class="rounded px-2 py-1 text-xs {generation === gen ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
								onclick={() => toggleGeneration(gen)}
							>
								第{gen}世代
							</button>
						{/each}
					</div>
				</div>

				<!-- カテゴリフィルター -->
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-700">カテゴリ</label>
					<div class="flex flex-wrap gap-1">
						<button
							class="rounded px-2 py-1 text-xs {type === null ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
							onclick={() => toggleType(null)}
						>
							すべて
						</button>
						{#each RIBBON_TYPES as rt (rt.id)}
							<button
								class="rounded px-2 py-1 text-xs {type === rt.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
								onclick={() => toggleType(rt.id)}
							>
								{rt.name}
							</button>
						{/each}
					</div>
				</div>

				<!-- 取得状況フィルター -->
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-700">取得状況</label>
					<div class="flex flex-wrap gap-1">
						<button
							class="rounded px-2 py-1 text-xs {status === null ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
							onclick={() => toggleStatus(null)}
						>
							すべて
						</button>
						<button
							class="rounded px-2 py-1 text-xs {status === 'obtained' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
							onclick={() => toggleStatus('obtained')}
						>
							取得済み
						</button>
						<button
							class="rounded px-2 py-1 text-xs {status === 'not-obtained' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
							onclick={() => toggleStatus('not-obtained')}
						>
							未取得
						</button>
					</div>
				</div>
			</div>

			<!-- リセットボタン -->
			<div class="mt-2 text-right">
				<button
					class="rounded bg-gray-200 px-3 py-1 text-xs hover:bg-gray-300"
					onclick={resetFilters}
				>
					リセット
				</button>
			</div>
		</div>
	{/if}
</div>
