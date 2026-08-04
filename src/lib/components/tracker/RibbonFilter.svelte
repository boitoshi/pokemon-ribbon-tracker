<script lang="ts">
	import type { FilterState } from '$lib/types';

	/**
	 * リボン絞り込みパネル。
	 *
	 * フィルタ状態は親（/box）が1箇所で持ち、ここは表示と通知だけを担当する。
	 * 以前は generation だけ親、type/status/search はこのコンポーネント内 state という
	 * 二重管理になっていて、リセット処理も2箇所に散っていた。
	 */
	interface Props {
		/** 現在のフィルタ状態（唯一の正） */
		filter: FilterState;
		/** フィルタの部分更新を親に通知する */
		onChange: (_patch: Partial<FilterState>) => void;
		/** すべてのフィルタを解除する（世代ピルも含む） */
		onReset: () => void;
	}

	const { filter, onChange, onReset }: Props = $props();

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

	/** フィルターパネルの開閉状態（表示上の状態なのでここで持つ） */
	let isExpanded = $state(false);

	/** アクティブなフィルター数（generation は画面上に世代ピルとして常時見えているので除外） */
	const activeFilterCount: number = $derived(
		(filter.type !== null ? 1 : 0) + (filter.status !== null ? 1 : 0)
	);

	/** タイプIDから日本語名を取得する */
	function getRibbonTypeName(typeId: string): string {
		return RIBBON_TYPES.find((t) => t.id === typeId)?.name ?? typeId;
	}

	function toggleType(t: string | null): void {
		onChange({ type: filter.type === t ? null : t });
	}

	function toggleStatus(s: FilterState['status']): void {
		onChange({ status: filter.status === s ? null : s });
	}
</script>

<div class="mb-2 md:mb-4">
	<!-- 検索バーとフィルタートグル（常時表示） -->
	<div class="flex items-center gap-2">
		<input
			type="text"
			value={filter.search}
			placeholder="リボンを検索..."
			oninput={(e) => onChange({ search: e.currentTarget.value })}
			class="flex-1 rounded-md border px-3 py-2 text-sm"
		/>
		<button
			type="button"
			class="flex items-center gap-1 rounded border px-3 py-2 text-sm
				{isExpanded
				? 'border-blue-500 bg-blue-500 text-white'
				: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
			aria-expanded={isExpanded}
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
			{#if filter.type !== null}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
				>
					{getRibbonTypeName(filter.type)}
					<button type="button" class="hover:text-blue-500" onclick={() => toggleType(null)}>×</button
					>
				</span>
			{/if}
			{#if filter.status !== null}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
				>
					{filter.status === 'obtained' ? '取得済み' : '未取得'}
					<button type="button" class="hover:text-blue-500" onclick={() => toggleStatus(null)}
						>×</button
					>
				</span>
			{/if}
		</div>
	{/if}

	<!-- 折りたたみフィルターパネル -->
	{#if isExpanded}
		<div class="mt-2 rounded-lg border bg-gray-50 p-3">
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<!-- カテゴリフィルター -->
				<div>
					<p class="mb-1 block text-xs font-medium text-gray-700">カテゴリ</p>
					<div class="flex flex-wrap gap-1">
						<button
							type="button"
							class="rounded px-2 py-1 text-xs {filter.type === null
								? 'bg-blue-500 text-white'
								: 'bg-gray-200'}"
							onclick={() => toggleType(null)}
						>
							すべて
						</button>
						{#each RIBBON_TYPES as rt (rt.id)}
							<button
								type="button"
								class="rounded px-2 py-1 text-xs {filter.type === rt.id
									? 'bg-blue-500 text-white'
									: 'bg-gray-200'}"
								onclick={() => toggleType(rt.id)}
							>
								{rt.name}
							</button>
						{/each}
					</div>
				</div>

				<!-- 取得状況フィルター -->
				<div>
					<p class="mb-1 block text-xs font-medium text-gray-700">取得状況</p>
					<div class="flex flex-wrap gap-1">
						<button
							type="button"
							class="rounded px-2 py-1 text-xs {filter.status === null
								? 'bg-blue-500 text-white'
								: 'bg-gray-200'}"
							onclick={() => toggleStatus(null)}
						>
							すべて
						</button>
						<button
							type="button"
							class="rounded px-2 py-1 text-xs {filter.status === 'obtained'
								? 'bg-blue-500 text-white'
								: 'bg-gray-200'}"
							onclick={() => toggleStatus('obtained')}
						>
							取得済み
						</button>
						<button
							type="button"
							class="rounded px-2 py-1 text-xs {filter.status === 'not-obtained'
								? 'bg-blue-500 text-white'
								: 'bg-gray-200'}"
							onclick={() => toggleStatus('not-obtained')}
						>
							未取得
						</button>
					</div>
				</div>
			</div>

			<!-- リセットボタン（世代・検索も含めて全部解除する） -->
			<div class="mt-2 text-right">
				<button
					type="button"
					class="rounded bg-gray-200 px-3 py-1 text-xs hover:bg-gray-300"
					onclick={onReset}
				>
					すべて解除
				</button>
			</div>
		</div>
	{/if}
</div>
