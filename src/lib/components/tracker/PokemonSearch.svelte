<script lang="ts">
	import type { Game, PokemonDetail } from '$lib/types';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { setup } from '$lib/stores/setup.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { GAMES } from '$lib/data/games';
	import { normalizeForSearch } from '$lib/utils/searchNormalize';

	/** Props */
	let { allPokemon }: { allPokemon: PokemonDetail[] } = $props();

	/** 検索クエリ */
	let searchQuery = $state('');

	/** 検索結果（最大20件） */
	const MAX_RESULTS = 20;

	/** 1タップ登録時のデフォルトレベル */
	const DEFAULT_LEVEL = 1;
	/** 図鑑番号のゼロ埋め桁数 */
	const DEX_NUMBER_DIGITS = 3;
	/** ソフトピッカーの未選択ラベル */
	const PICKER_UNSELECTED_LABEL = 'ソフトを選んでね';

	const results = $derived(
		(() => {
			const query = normalizeForSearch(searchQuery.trim());
			if (!query) return [];
			return allPokemon
				.filter((p) => normalizeForSearch(p.name).includes(query))
				.slice(0, MAX_RESULTS);
		})()
	);

	const SEARCH_INPUT_ID = 'pokemon-search-input';
	const PICKER_SELECT_ID = 'start-with-pokemon-game-picker';

	/** ソフトピッカーを開いているポケモンID（nullなら閉じている） */
	let pickerPokemonId = $state<string | null>(null);
	/** ソフトピッカーで選択中のゲームID */
	let pickerGameId = $state('');

	/**
	 * 所持ソフトのうち「いちばん古い世代」のものを返す。
	 * 同世代内は発売日が古いものを優先。所持設定が空なら null。
	 *
	 * 最新ではなく最古を既定にするのは、リボン制覇が世代を遡れないため
	 * 新しく育て始める個体は必ず最古の世代からスタートするから。
	 * 加えて外したときの実害が小さい: 最新を既定にして外すと maxRibbonGen < currentGen が
	 * 成立して旧世代リボンが軒並み missed（もう取れない）表示になるが、
	 * 最古で外れた場合は新世代が future（これから取れる）になるだけで済む。
	 */
	function pickEarliestOwnedGame(ownedGameIds: string[]): Game | null {
		const owned: Game[] = GAMES.filter((g) => ownedGameIds.includes(g.id));
		if (owned.length === 0) return null;
		return owned.reduce((best, game) => {
			if (game.generation !== best.generation) {
				return game.generation < best.generation ? game : best;
			}
			return game.releaseDate < best.releaseDate ? game : best;
		});
	}

	/**
	 * 1タップ登録に使う既定のゲーム。
	 * 所持設定から推論できるときだけ値が入る。空なら null のままにして、
	 * 推論できない currentGame を勝手に作らない（記録アプリなので捏造は禁物）。
	 */
	const ownedDefaultGame: Game | null = $derived(pickEarliestOwnedGame(setup.ownedGames));

	/** ソフトピッカーを閉じる */
	function closePicker(): void {
		pickerPokemonId = null;
		pickerGameId = '';
	}

	/** ポケモンを選択する */
	function selectPokemon(pokemon: PokemonDetail): void {
		ribbonProgress.selectPokemon(pokemon);
		searchQuery = '';
		closePicker();
	}

	/** マイポケモン登録して主役（アクティブ）に切り替える */
	function registerAndActivate(pokemon: PokemonDetail, game: Game): void {
		const id = ribbonProgress.addMyPokemon({
			pokemonId: pokemon.id,
			nickname: '',
			// 出身は「捕まえたソフトに今もいる」という妥当な推論として現在ゲームで補完する
			originGame: game.id,
			currentGame: game.id,
			level: DEFAULT_LEVEL,
			isTransferredToHome: false,
			memo: ''
		});
		ribbonProgress.switchMyPokemon(id);
		searchQuery = '';
		closePicker();
		toast.success(`${pokemon.name} で記録スタート！現在のゲームは${game.shortName}にしたよ`);
	}

	/**
	 * 「このコで始める」。
	 * 所持ソフト設定から現在ゲームを推論できれば1タップで登録、
	 * できなければその場のピッカーで選んでもらう（仮置きはしない）。
	 */
	function startWithPokemon(pokemon: PokemonDetail): void {
		if (ownedDefaultGame) {
			registerAndActivate(pokemon, ownedDefaultGame);
			return;
		}
		pickerPokemonId = pokemon.id;
		pickerGameId = '';
	}

	/** ピッカーで選んだソフトで登録を確定する */
	function confirmPicker(pokemon: PokemonDetail): void {
		const game = GAMES.find((g) => g.id === pickerGameId);
		if (!game) return;
		registerAndActivate(pokemon, game);
	}

	/** 図鑑番号を3桁ゼロ埋みでフォーマットする */
	function formatDexNumber(n: number): string {
		return String(n).padStart(DEX_NUMBER_DIGITS, '0');
	}
</script>

<div class="rounded-lg bg-white p-2 shadow md:p-4">
	<div class="mb-2 md:mb-4">
		<label for={SEARCH_INPUT_ID} class="mb-1 block text-xs font-bold text-gray-700 md:mb-2">
			ポケモンを検索
		</label>
		<div class="relative">
			<input
				id={SEARCH_INPUT_ID}
				type="text"
				bind:value={searchQuery}
				oninput={closePicker}
				placeholder="ピカチュウ、フシギダネなど..."
				class="w-full rounded-lg border px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base"
			/>
		</div>
	</div>

	<!-- 検索結果リスト -->
	{#if results.length > 0}
		<div class="mt-2 max-h-60 overflow-y-auto md:max-h-80">
			{#each results as pokemon (pokemon.id)}
				<div class="rounded {pickerPokemonId === pokemon.id ? 'bg-blue-50' : ''}">
					<div class="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-100">
						<!-- ポケモンを選ぶ（従来どおりの挙動） -->
						<button
							class="flex min-w-0 flex-1 items-center text-left"
							onclick={() => selectPokemon(pokemon)}
						>
							<!-- サムネイル -->
							<div class="mr-3 h-10 w-10 shrink-0">
								{#if pokemon.image}
									<img
										src={pokemon.image}
										alt={pokemon.name}
										class="h-full w-full object-contain"
									/>
								{:else}
									<div class="h-full w-full rounded-full bg-gray-200"></div>
								{/if}
							</div>
							<!-- 名前・図鑑番号 -->
							<div class="min-w-0">
								<div class="truncate text-sm font-medium">{pokemon.name}</div>
								<div class="text-xs text-gray-500">#{formatDexNumber(pokemon.dexNumber)}</div>
							</div>
						</button>

						<!-- 登録＋主役化（所持設定があれば1タップ、無ければピッカーを開く） -->
						<button
							type="button"
							class="shrink-0 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white
								hover:bg-blue-600 active:bg-blue-700"
							aria-expanded={pickerPokemonId === pokemon.id}
							onclick={() => startWithPokemon(pokemon)}
						>
							このコで始める
						</button>
					</div>

					<!-- ソフトピッカー（所持設定が空のときだけ出る） -->
					{#if pickerPokemonId === pokemon.id}
						<div class="border-t border-blue-200 px-2 pt-2 pb-2">
							<label for={PICKER_SELECT_ID} class="mb-1 block text-xs font-medium text-gray-700">
								{pokemon.name} は今どのソフトにいる？
							</label>
							<div class="flex gap-1.5">
								<select
									id={PICKER_SELECT_ID}
									bind:value={pickerGameId}
									class="min-w-0 flex-1 rounded border bg-white px-2 py-1.5 text-sm"
								>
									<option value="">{PICKER_UNSELECTED_LABEL}</option>
									{#each GAMES as game (game.id)}
										<option value={game.id}>{game.name}</option>
									{/each}
								</select>
								<button
									type="button"
									class="shrink-0 rounded bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white
										hover:bg-blue-600 active:bg-blue-700
										disabled:cursor-not-allowed disabled:opacity-50"
									disabled={!pickerGameId}
									onclick={() => confirmPicker(pokemon)}
								>
									はじめる
								</button>
								<button
									type="button"
									class="shrink-0 rounded bg-gray-200 px-2 py-1.5 text-xs hover:bg-gray-300"
									onclick={closePicker}
								>
									やめる
								</button>
							</div>
							<p class="mt-1 text-xs text-gray-500">
								セットアップで持ってるソフトを登録すると、次からは1タップで始められるよ
							</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else if searchQuery.trim()}
		<div class="py-4 text-center">
			<p class="text-gray-500">ポケモンが見つかりません</p>
			<p class="text-sm text-gray-400">別の名前で検索してください</p>
		</div>
	{/if}
</div>
