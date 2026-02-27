<script lang="ts">
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { getGameName } from '$lib/utils/gameNames';

	/** タイプ別Tailwindクラスマッピング（18タイプ対応） */
	const TYPE_CLASSES: Record<string, string> = {
		ノーマル: 'bg-gray-400',
		ほのお: 'bg-orange-500',
		みず: 'bg-blue-500',
		でんき: 'bg-yellow-400',
		くさ: 'bg-green-500',
		こおり: 'bg-cyan-300',
		かくとう: 'bg-red-700',
		どく: 'bg-purple-500',
		じめん: 'bg-yellow-700',
		ひこう: 'bg-blue-400',
		エスパー: 'bg-pink-400',
		むし: 'bg-lime-500',
		いわ: 'bg-yellow-600',
		ゴースト: 'bg-purple-700',
		ドラゴン: 'bg-indigo-600',
		あく: 'bg-gray-700',
		はがね: 'bg-gray-500',
		フェアリー: 'bg-pink-300'
	};

	/** タイプ名からTailwindクラスを取得する */
	function getTypeClass(type: string): string {
		return TYPE_CLASSES[type] ?? 'bg-gray-400';
	}

	/** リボン獲得率を計算する */
	const ribbonPercentage = $derived(
		ribbonProgress.allRibbons.length === 0
			? 0
			: Math.round(
					(ribbonProgress.currentCheckedRibbons.length / ribbonProgress.allRibbons.length) * 100
				)
	);
</script>

{#if ribbonProgress.selectedPokemon}
	{@const pokemon = ribbonProgress.selectedPokemon}
	<div class="rounded-lg bg-white p-2 shadow md:p-4">
		<!-- ポケモン基本情報 -->
		<div class="mb-2 flex items-center md:mb-4">
			<div class="mr-2 md:mr-4">
				{#if pokemon.image}
					<img
						src={pokemon.image}
						alt={pokemon.name}
						class="h-16 w-16 object-contain md:h-24 md:w-24"
					/>
				{:else}
					<div class="h-16 w-16 rounded-full bg-gray-200 md:h-24 md:w-24"></div>
				{/if}
			</div>

			<div>
				<h2 class="text-lg font-bold md:text-xl">{pokemon.name}</h2>
				<p class="text-gray-600">
					#{String(pokemon.dexNumber).padStart(3, '0')}
				</p>
				<!-- タイプバッジ -->
				<div class="mt-1 flex gap-1 md:gap-2">
					{#each pokemon.types as type (type)}
						<span class="rounded px-2 py-1 text-xs text-white {getTypeClass(type)}">
							{type}
						</span>
					{/each}
				</div>
			</div>
		</div>

		<!-- マイポケモン追加情報 -->
		{#if ribbonProgress.activeMyPokemon}
			{@const mp = ribbonProgress.activeMyPokemon}
			<div class="mt-2 rounded-lg bg-blue-50 p-2 md:mt-3 md:p-3">
				<div class="flex flex-wrap gap-2 text-sm">
					{#if mp.nickname}
						<span class="inline-flex items-center gap-1">
							<span class="text-gray-500">NN:</span>
							<span class="font-medium">{mp.nickname}</span>
						</span>
					{/if}
					{#if mp.originGame}
						<span class="inline-flex items-center gap-1">
							<span class="text-gray-500">出身:</span>
							<span class="font-medium">{getGameName(mp.originGame)}</span>
						</span>
					{/if}
					{#if mp.currentGame}
						<span class="inline-flex items-center gap-1">
							<span class="text-gray-500">現在:</span>
							<span class="font-medium">{getGameName(mp.currentGame)}</span>
						</span>
					{/if}
					{#if mp.level}
						<span class="inline-flex items-center gap-1">
							<span class="text-gray-500">Lv:</span>
							<span class="font-medium">{mp.level}</span>
						</span>
					{/if}
				</div>
				{#if mp.memo}
					<p class="mt-1 text-xs text-gray-600">{mp.memo}</p>
				{/if}
			</div>
		{/if}

		<!-- リボン獲得率 -->
		<div class="mt-2 rounded-lg bg-gray-50 p-2 md:mt-4 md:p-3">
			<div class="flex items-center justify-between">
				<span class="font-medium text-sm">リボン獲得率</span>
				<span class="text-sm font-bold">
					{ribbonProgress.currentCheckedRibbons.length} / {ribbonProgress.allRibbons.length}
					({ribbonPercentage}%)
				</span>
			</div>
			<div class="mt-1 h-2 w-full rounded-full bg-gray-200">
				<div
					class="h-2 rounded-full bg-blue-500 transition-all"
					style="width: {ribbonPercentage}%"
				></div>
			</div>
		</div>
	</div>
{:else}
	<!-- プレースホルダー -->
	<div class="rounded-lg bg-gray-50 p-4 text-center md:p-8">
		<p class="text-gray-500">ポケモンを選択してください</p>
	</div>
{/if}
