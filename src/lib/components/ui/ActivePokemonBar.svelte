<script lang="ts">
	import type { MyPokemon, PokemonDetail } from '$lib/types';
	import { ribbonProgress, type RibbonCount } from '$lib/stores/ribbonProgress.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import MyPokemonPanel from '$lib/components/tracker/MyPokemonPanel.svelte';

	/** ボトムシートの表示状態 */
	let sheetOpen = $state(false);
	/** シートを開いたトリガー要素（閉じたときにフォーカス復帰させる） */
	let triggerEl = $state<HTMLElement | null>(null);

	/** 現在の主役ポケモン（未選択なら null） */
	const active: MyPokemon | null = $derived(ribbonProgress.activeMyPokemon);

	/** 主役ポケモンの種族データ（未選択なら null） */
	const species: PokemonDetail | null = $derived(ribbonProgress.activeSpecies);

	/** 主役ポケモンの画像URL */
	const image: string | undefined = $derived(species?.image);

	/** 表示名（ニックネーム優先、なければ種族名） */
	const displayName: string = $derived(
		(() => {
			if (!active) return '';
			if (active.nickname) return active.nickname;
			return species?.name ?? active.pokemonId;
		})()
	);

	/**
	 * 主役ポケモンのリボン取得数（取得済み / この個体で狙える数）。
	 *
	 * generationProgress は「今画面で見ている種族（selectedPokemon）」依存で分母がブレるため、
	 * 主役の種族に固定して集計するストア側の derived を使う。
	 */
	const ribbonCount: RibbonCount = $derived(ribbonProgress.activeRibbonCount);

	function openSheet(e: MouseEvent): void {
		triggerEl = e.currentTarget as HTMLElement;
		sheetOpen = true;
	}

	function closeSheet(): void {
		sheetOpen = false;
		triggerEl?.focus();
		triggerEl = null;
	}
</script>

<!-- 主役バー（主役未選択のときは丸ごと描画しない） -->
{#if active}
	<div class="border-b border-blue-100 bg-blue-50">
		<button
			type="button"
			class="mx-auto flex h-10 w-full max-w-7xl items-center gap-2 px-3 text-left
				transition-colors hover:bg-blue-100 active:bg-blue-200"
			aria-haspopup="dialog"
			aria-expanded={sheetOpen}
			onclick={openSheet}
		>
			<span class="shrink-0 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
				主役
			</span>

			{#if image}
				<img src={image} alt="" class="h-8 w-8 shrink-0 object-contain" />
			{:else}
				<span class="h-8 w-8 shrink-0 rounded-full bg-gray-200"></span>
			{/if}

			<span class="truncate text-sm font-semibold text-gray-800">{displayName}</span>
			<span class="shrink-0 text-xs text-gray-500">Lv.{active.level}</span>

			{#if ribbonCount.total > 0}
				<span class="ml-auto shrink-0 text-xs font-bold tabular-nums text-blue-700">
					{ribbonCount.obtained}/{ribbonCount.total}
				</span>
			{:else}
				<span class="ml-auto"></span>
			{/if}
			<span class="shrink-0 text-xs text-gray-400" aria-hidden="true">▾</span>
			<span class="sr-only">主役ポケモンを切り替える</span>
		</button>
	</div>
{/if}

<!-- 切り替えシート（主役が消えても開いたままにして選び直せるようにする） -->
<BottomSheet open={sheetOpen} onClose={closeSheet} title="主役ポケモンを切り替え">
	<!-- シートを開いた時点で一覧が見えるよう、パネルは開いた状態で始める -->
	<MyPokemonPanel defaultOpen />
</BottomSheet>
