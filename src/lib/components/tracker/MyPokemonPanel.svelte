<script lang="ts">
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { getGameName } from '$lib/utils/gameNames';
	import { GAMES } from '$lib/data/games';
	import type { MyPokemon } from '$lib/types';

	/** レベルの最小・最大値定数 */
	const MIN_LEVEL = 1;
	const MAX_LEVEL = 100;

	/** マイポケモン登録・編集フォームデータ型 */
	interface MyPokemonForm {
		nickname: string;
		originGame: string;
		currentGame: string;
		currentGeneration: number;
		level: number;
		isTransferredToHome: boolean;
		memo: string;
	}

	/** パネルの開閉状態 */
	let isOpen = $state(true);
	/** フォーム表示状態 */
	let showForm = $state(false);
	/** 編集中のマイポケモンID（nullは新規登録） */
	let editingId = $state<string | null>(null);
	/** 削除確認中のマイポケモンID */
	let removingId = $state<string | null>(null);

	/** フォームデータ */
	let form = $state<MyPokemonForm>({
		nickname: '',
		originGame: '',
		currentGame: '',
		currentGeneration: 0,
		level: 1,
		isTransferredToHome: false,
		memo: ''
	});

	/** originGameが変わったらcurrentGenerationを自動計算する */
	$effect(() => {
		if (form.originGame) {
			const game = ribbonProgress.allGames.find((g) => g.id === form.originGame);
			if (game) {
				form.currentGeneration = game.generation;
				// currentGameがまだ未設定なら出身ゲームをデフォルトにする
				if (!form.currentGame) {
					form.currentGame = form.originGame;
				}
			}
		}
	});

	/** ポケモンの画像URLを取得する */
	function getPokemonImage(pokemonId: string): string | undefined {
		return ribbonProgress.allPokemon.find((p) => p.id === pokemonId)?.image;
	}

	/** 表示名（ニックネーム優先、なければポケモン名）を取得する */
	function getDisplayName(mp: MyPokemon): string {
		if (mp.nickname) return mp.nickname;
		const detail = ribbonProgress.allPokemon.find((p) => p.id === mp.pokemonId);
		return detail?.name ?? mp.pokemonId;
	}

	/** 進捗率を取得する */
	function getProgress(myPokemonId: string): number {
		if (ribbonProgress.allRibbons.length === 0) return 0;
		const checked = ribbonProgress.progress[myPokemonId]?.length ?? 0;
		return Math.round((checked / ribbonProgress.allRibbons.length) * 100);
	}

	/** フォームを初期状態にリセットする */
	function resetForm(): void {
		form = {
			nickname: '',
			originGame: '',
			currentGame: '',
			currentGeneration: 0,
			level: 1,
			isTransferredToHome: false,
			memo: ''
		};
	}

	/** 新規登録フォームを開く */
	function openRegisterForm(): void {
		editingId = null;
		resetForm();
		showForm = true;
		isOpen = true;
	}

	/** 編集フォームを開く */
	function startEdit(mp: MyPokemon): void {
		editingId = mp.id;
		form = {
			nickname: mp.nickname,
			originGame: mp.originGame,
			currentGame: mp.currentGame,
			currentGeneration: mp.currentGeneration,
			level: mp.level,
			isTransferredToHome: mp.isTransferredToHome,
			memo: mp.memo
		};
		showForm = true;
	}

	/** フォームを送信する */
	function submitForm(): void {
		if (!ribbonProgress.selectedPokemon && !editingId) return;

		if (editingId) {
			// 編集
			ribbonProgress.updateMyPokemon(editingId, {
				nickname: form.nickname,
				originGame: form.originGame,
				currentGame: form.currentGame,
				currentGeneration: form.currentGeneration,
				level: form.level,
				isTransferredToHome: form.isTransferredToHome,
				memo: form.memo
			});
		} else if (ribbonProgress.selectedPokemon) {
			// 新規登録
			const id = ribbonProgress.addMyPokemon({
				pokemonId: ribbonProgress.selectedPokemon.id,
				nickname: form.nickname,
				originGame: form.originGame,
				currentGame: form.currentGame,
				currentGeneration: form.currentGeneration,
				level: form.level,
				isTransferredToHome: form.isTransferredToHome,
				memo: form.memo
			});
			// 登録後すぐにアクティブにする
			ribbonProgress.switchMyPokemon(id);
		}
		cancelForm();
	}

	/** フォームをキャンセルする */
	function cancelForm(): void {
		showForm = false;
		editingId = null;
		resetForm();
	}

	/** 削除確認状態をセットする */
	function confirmRemove(id: string): void {
		removingId = id;
	}

	/** 削除を実行する */
	function executeRemove(): void {
		if (removingId) {
			ribbonProgress.removeMyPokemon(removingId);
			removingId = null;
		}
	}

	/** 削除をキャンセルする */
	function cancelRemove(): void {
		removingId = null;
	}
</script>

<div class="mb-4 rounded-lg border bg-white shadow-sm md:mb-8">
	<!-- ヘッダー（クリックで開閉） -->
	<button
		class="flex w-full items-center justify-between p-3 hover:bg-gray-50 md:p-4"
		onclick={() => (isOpen = !isOpen)}
	>
		<div class="flex items-center gap-2">
			<h3 class="text-sm font-bold md:text-base">マイポケモン</h3>
			<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
				{ribbonProgress.myPokemonList.length}
			</span>
		</div>
		<span class="text-sm text-gray-400">{isOpen ? '▲' : '▼'}</span>
	</button>

	<!-- パネル本体 -->
	{#if isOpen}
		<div class="px-3 pb-3 md:px-4 md:pb-4">
			<!-- マイポケモン未登録かつポケモン未選択 -->
			{#if ribbonProgress.myPokemonList.length === 0 && !ribbonProgress.selectedPokemon}
				<div class="py-4 text-center text-sm text-gray-500">
					ポケモンを検索・選択して「マイポケモンに登録」してください
				</div>
			{/if}

			<!-- マイポケモン一覧 -->
			{#if ribbonProgress.myPokemonList.length > 0}
				<div class="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-3 lg:grid-cols-4">
					{#each ribbonProgress.myPokemonList as mp (mp.id)}
						<div
							class="w-36 flex-shrink-0 cursor-pointer rounded-lg border p-2 transition-colors hover:bg-gray-50 md:w-auto
								{ribbonProgress.activeMyPokemonId === mp.id ? 'bg-blue-50 ring-2 ring-blue-500' : ''}"
							role="button"
							tabindex="0"
							onclick={() => ribbonProgress.switchMyPokemon(mp.id)}
							onkeydown={(e) => e.key === 'Enter' && ribbonProgress.switchMyPokemon(mp.id)}
						>
							<div class="flex items-center gap-2">
								<!-- ポケモン画像 -->
								{#if getPokemonImage(mp.pokemonId)}
									<img
										src={getPokemonImage(mp.pokemonId)}
										alt={getDisplayName(mp)}
										class="h-10 w-10 object-contain"
									/>
								{:else}
									<div class="h-10 w-10 rounded-full bg-gray-200"></div>
								{/if}
								<div class="min-w-0 flex-1">
									<div class="truncate text-sm font-medium">{getDisplayName(mp)}</div>
									<div class="truncate text-xs text-gray-500">
										{mp.originGame ? getGameName(mp.originGame) : '未設定'}
									</div>
									<div class="text-xs text-blue-600">{getProgress(mp.id)}%</div>
								</div>
							</div>

							<!-- 編集・削除ボタン -->
							<div class="mt-1 flex gap-1">
								<button
									class="px-1 text-xs text-gray-400 hover:text-blue-500"
									onclick={(e) => { e.stopPropagation(); startEdit(mp); }}
								>
									編集
								</button>
								<button
									class="px-1 text-xs text-gray-400 hover:text-red-500"
									onclick={(e) => { e.stopPropagation(); confirmRemove(mp.id); }}
								>
									削除
								</button>
							</div>

							<!-- 削除確認UI -->
							{#if removingId === mp.id}
								<div class="mt-1 rounded border border-red-200 bg-red-50 p-1.5 text-xs">
									<p class="mb-1 text-red-700">本当に削除しますか？</p>
									<div class="flex gap-1">
										<button
											class="rounded bg-red-500 px-2 py-0.5 text-white hover:bg-red-600"
											onclick={(e) => { e.stopPropagation(); executeRemove(); }}
										>
											削除
										</button>
										<button
											class="rounded bg-gray-200 px-2 py-0.5 hover:bg-gray-300"
											onclick={(e) => { e.stopPropagation(); cancelRemove(); }}
										>
											キャンセル
										</button>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<!-- 新規登録ボタン（ポケモン選択中かつフォーム非表示時） -->
			{#if ribbonProgress.selectedPokemon && !showForm}
				<div class="mt-3">
					<button
						class="w-full rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
						onclick={openRegisterForm}
					>
						{ribbonProgress.selectedPokemon.name} をマイポケモンに登録
					</button>
				</div>
			{/if}

			<!-- 登録/編集フォーム -->
			{#if showForm}
				<div class="mt-3 rounded-lg border bg-gray-50 p-3">
					<h4 class="mb-2 text-sm font-medium">
						{editingId ? 'マイポケモンを編集' : 'マイポケモンに登録'}
					</h4>
					<div class="space-y-2">
						<!-- ニックネーム -->
						<div>
							<label class="mb-0.5 block text-xs text-gray-600">ニックネーム（任意）</label>
							<input
								type="text"
								bind:value={form.nickname}
								placeholder="ニックネーム"
								class="w-full rounded border px-2 py-1.5 text-sm"
							/>
						</div>

						<!-- 出身ゲーム -->
						<div>
							<label class="mb-0.5 block text-xs text-gray-600">出身ゲーム（必須）</label>
							<select bind:value={form.originGame} class="w-full rounded border bg-white px-2 py-1.5 text-sm">
								<option value="">選択してください</option>
								{#each GAMES as game (game.id)}
									<option value={game.id}>{game.name}</option>
								{/each}
							</select>
						</div>

						<!-- 現在のゲーム -->
						<div>
							<label class="mb-0.5 block text-xs text-gray-600">現在のゲーム（必須）</label>
							<select bind:value={form.currentGame} class="w-full rounded border bg-white px-2 py-1.5 text-sm">
								<option value="">選択してください</option>
								{#each GAMES as game (game.id)}
									<option value={game.id}>{game.name}</option>
								{/each}
							</select>
						</div>

						<!-- レベル -->
						<div>
							<label class="mb-0.5 block text-xs text-gray-600">レベル（{MIN_LEVEL}〜{MAX_LEVEL}）</label>
							<input
								type="number"
								bind:value={form.level}
								min={MIN_LEVEL}
								max={MAX_LEVEL}
								class="w-full rounded border px-2 py-1.5 text-sm"
							/>
						</div>

						<!-- HOME転送済み -->
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								id="isTransferredToHome"
								bind:checked={form.isTransferredToHome}
								class="h-4 w-4"
							/>
							<label for="isTransferredToHome" class="text-xs text-gray-600">
								Pokemon HOMEに転送済み
							</label>
						</div>

						<!-- メモ -->
						<div>
							<label class="mb-0.5 block text-xs text-gray-600">メモ（任意）</label>
							<textarea
								bind:value={form.memo}
								placeholder="メモ"
								rows={2}
								class="w-full rounded border px-2 py-1.5 text-sm"
							></textarea>
						</div>

						<!-- ボタン -->
						<div class="flex gap-2">
							<button
								class="flex-1 rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600
									disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!form.originGame || !form.currentGame}
								onclick={submitForm}
							>
								{editingId ? '更新' : '登録'}
							</button>
							<button
								class="rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300"
								onclick={cancelForm}
							>
								キャンセル
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
