<script lang="ts">
	import { untrack } from 'svelte';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { setup } from '$lib/stores/setup.svelte';
	import { getGameName } from '$lib/utils/gameNames';
	import { getMyPokemonDisplayName, getMyPokemonImage } from '$lib/utils/myPokemonDisplay';
	import { GAMES } from '$lib/data/games';
	import type { Game, MyPokemon } from '$lib/types';

	/** レベルの最小・最大値定数 */
	const MIN_LEVEL = 1;
	const MAX_LEVEL = 100;
	/** 新規登録時のデフォルトレベル */
	const DEFAULT_LEVEL = MIN_LEVEL;

	/** ゲーム選択UIのラベル定数 */
	const GAME_UNSELECTED_LABEL = '選択してください';
	const ORIGIN_SAME_AS_CURRENT_LABEL = '現在のゲームと同じ（未指定）';
	const ORIGIN_UNSET_SUMMARY = '未指定';
	const OWNED_GROUP_LABEL = '持ってるソフト';
	const OTHER_GROUP_LABEL = 'そのほか';

	/** マイポケモン登録・編集フォームデータ型 */
	interface MyPokemonForm {
		nickname: string;
		originGame: string;
		currentGame: string;
		level: number;
		isTransferredToHome: boolean;
		memo: string;
	}

	/** Props */
	interface Props {
		/** パネルを最初から開いた状態で描画するか（ボトムシート内など） */
		defaultOpen?: boolean;
	}
	let { defaultOpen = false }: Props = $props();

	/**
	 * パネルの開閉状態。
	 * defaultOpen は「初期状態の指定」なので untrack で初回の値だけを取る。
	 * 追従させると、ユーザーが閉じたあとに親の再描画で勝手に開き直ってしまう。
	 */
	let isOpen = $state(untrack(() => defaultOpen));
	/** フォーム表示状態 */
	let showForm = $state(false);
	/** 編集中のマイポケモンID（nullは新規登録） */
	let editingId = $state<string | null>(null);
	/** 削除確認中のマイポケモンID */
	let removingId = $state<string | null>(null);
	/** 出身ゲーム（任意項目）の入力欄を開いているか */
	let showOriginGame = $state(false);

	/** フォームデータ */
	let form = $state<MyPokemonForm>({
		nickname: '',
		originGame: '',
		currentGame: '',
		level: DEFAULT_LEVEL,
		isTransferredToHome: false,
		memo: ''
	});

	/** 所持しているソフト（セットアップ設定順ではなくGAMESの並び順を維持する） */
	const ownedGameList: Game[] = $derived(GAMES.filter((g) => setup.ownedGames.includes(g.id)));
	/** 所持していないソフト */
	const otherGameList: Game[] = $derived(GAMES.filter((g) => !setup.ownedGames.includes(g.id)));
	/** 所持設定があるか（未設定なら全件をフラットに出す） */
	const hasOwnedGames: boolean = $derived(ownedGameList.length > 0);

	const FORM_ID = {
		nickname: 'my-pokemon-nickname',
		originGame: 'my-pokemon-origin-game',
		currentGame: 'my-pokemon-current-game',
		level: 'my-pokemon-level',
		memo: 'my-pokemon-memo'
	} as const;

	/** originGameが変わったらcurrentGameをデフォルト設定する */
	$effect(() => {
		if (form.originGame) {
			// currentGameがまだ未設定なら出身ゲームをデフォルトにする
			if (!form.currentGame) {
				form.currentGame = form.originGame;
			}
		}
	});

	/** ゲームIDから短い表示名を取得する（GAMES優先、未知IDは名称表にフォールバック） */
	function getGameShortName(gameId: string): string {
		return GAMES.find((g) => g.id === gameId)?.shortName ?? getGameName(gameId);
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
			level: DEFAULT_LEVEL,
			isTransferredToHome: false,
			memo: ''
		};
		showOriginGame = false;
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
			level: mp.level,
			isTransferredToHome: mp.isTransferredToHome,
			memo: mp.memo
		};
		// 現在のゲームと違う出身ゲームが入っているときだけ開いた状態で見せる
		showOriginGame = Boolean(mp.originGame) && mp.originGame !== mp.currentGame;
		showForm = true;
	}

	/** フォームを送信する */
	function submitForm(): void {
		if (!ribbonProgress.selectedPokemon && !editingId) return;
		// 必須は「現在のゲーム」だけ
		if (!form.currentGame) return;

		// 出身ゲームは任意。未指定なら現在のゲームで補完する（MyPokemon.originGame は必須フィールドのため）
		const originGame: string = form.originGame || form.currentGame;

		if (editingId) {
			// 編集
			ribbonProgress.updateMyPokemon(editingId, {
				nickname: form.nickname,
				originGame,
				currentGame: form.currentGame,
				level: form.level,
				isTransferredToHome: form.isTransferredToHome,
				memo: form.memo
			});
		} else if (ribbonProgress.selectedPokemon) {
			// 新規登録
			const id = ribbonProgress.addMyPokemon({
				pokemonId: ribbonProgress.selectedPokemon.id,
				nickname: form.nickname,
				originGame,
				currentGame: form.currentGame,
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

<!-- ゲーム選択肢（所持ソフトを先頭グループに寄せる。所持設定が空なら全件フラット） -->
{#snippet gameOptions()}
	{#if hasOwnedGames}
		<optgroup label={OWNED_GROUP_LABEL}>
			{#each ownedGameList as game (game.id)}
				<option value={game.id}>{game.name}</option>
			{/each}
		</optgroup>
		{#if otherGameList.length > 0}
			<optgroup label={OTHER_GROUP_LABEL}>
				{#each otherGameList as game (game.id)}
					<option value={game.id}>{game.name}</option>
				{/each}
			</optgroup>
		{/if}
	{:else}
		{#each GAMES as game (game.id)}
			<option value={game.id}>{game.name}</option>
		{/each}
	{/if}
{/snippet}

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
						{@const displayName = getMyPokemonDisplayName(mp, ribbonProgress.allPokemon)}
						{@const imageUrl = getMyPokemonImage(mp.pokemonId, ribbonProgress.allPokemon)}
						<div
							class="w-36 shrink-0 cursor-pointer rounded-lg border p-2 transition-colors hover:bg-gray-50 md:w-auto
								{ribbonProgress.activeMyPokemonId === mp.id ? 'bg-blue-50 ring-2 ring-blue-500' : ''}"
							role="button"
							tabindex="0"
							aria-pressed={ribbonProgress.activeMyPokemonId === mp.id}
							onclick={() => ribbonProgress.switchMyPokemon(mp.id)}
							onkeydown={(e) =>
								(e.key === 'Enter' || e.key === ' ') &&
								(e.preventDefault(), ribbonProgress.switchMyPokemon(mp.id))}
						>
							<div class="flex items-center gap-2">
								<!-- ポケモン画像 -->
								{#if imageUrl}
									<img src={imageUrl} alt={displayName} class="h-10 w-10 object-contain" />
								{:else}
									<div class="h-10 w-10 rounded-full bg-gray-200"></div>
								{/if}
								<div class="min-w-0 flex-1">
									<div class="truncate text-sm font-medium">{displayName}</div>
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
									onclick={(e) => {
										e.stopPropagation();
										startEdit(mp);
									}}
								>
									編集
								</button>
								<button
									class="px-1 text-xs text-gray-400 hover:text-red-500"
									onclick={(e) => {
										e.stopPropagation();
										confirmRemove(mp.id);
									}}
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
											onclick={(e) => {
												e.stopPropagation();
												executeRemove();
											}}
										>
											削除
										</button>
										<button
											class="rounded bg-gray-200 px-2 py-0.5 hover:bg-gray-300"
											onclick={(e) => {
												e.stopPropagation();
												cancelRemove();
											}}
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
							<label for={FORM_ID.nickname} class="mb-0.5 block text-xs text-gray-600"
								>ニックネーム（任意）</label
							>
							<input
								id={FORM_ID.nickname}
								type="text"
								bind:value={form.nickname}
								placeholder="ニックネーム"
								class="w-full rounded border px-2 py-1.5 text-sm"
							/>
						</div>

						<!-- 現在のゲーム（唯一の必須項目） -->
						<div>
							<label
								for={FORM_ID.currentGame}
								class="mb-0.5 block text-xs font-medium text-gray-700"
							>
								現在のゲーム（必須）
							</label>
							<select
								id={FORM_ID.currentGame}
								bind:value={form.currentGame}
								class="w-full rounded border bg-white px-2 py-1.5 text-sm"
							>
								<option value="">{GAME_UNSELECTED_LABEL}</option>
								{@render gameOptions()}
							</select>
							{#if form.currentGame}
								{@const currentGen = ribbonProgress.allGames.find(
									(g) => g.id === form.currentGame
								)?.generation}
								{#if currentGen}
									<p class="text-xs text-gray-500">現在の世代: Gen{currentGen}（自動）</p>
								{/if}
							{/if}
						</div>

						<!-- 出身ゲーム（任意・初期状態は折りたたみ） -->
						<div class="rounded border border-dashed border-gray-300 bg-white">
							<button
								type="button"
								class="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-xs text-gray-600 hover:bg-gray-50"
								aria-expanded={showOriginGame}
								onclick={() => (showOriginGame = !showOriginGame)}
							>
								<span class="min-w-0 truncate">
									出身ゲーム（任意）
									<span class="ml-1 text-gray-400">
										{form.originGame ? getGameShortName(form.originGame) : ORIGIN_UNSET_SUMMARY}
									</span>
								</span>
								<span class="shrink-0 text-gray-400">{showOriginGame ? '▲' : '▼'}</span>
							</button>
							{#if showOriginGame}
								<div class="px-2 pb-2">
									<select
										id={FORM_ID.originGame}
										aria-label="出身ゲーム（任意）"
										bind:value={form.originGame}
										class="w-full rounded border bg-white px-2 py-1.5 text-sm"
									>
										<option value="">{ORIGIN_SAME_AS_CURRENT_LABEL}</option>
										{@render gameOptions()}
									</select>
									<p class="mt-0.5 text-xs text-gray-500">
										未指定なら「現在のゲーム」と同じものが入るよ
									</p>
								</div>
							{/if}
						</div>

						<!-- レベル -->
						<div>
							<label for={FORM_ID.level} class="mb-0.5 block text-xs text-gray-600"
								>レベル（{MIN_LEVEL}〜{MAX_LEVEL}）</label
							>
							<input
								id={FORM_ID.level}
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
							<label for={FORM_ID.memo} class="mb-0.5 block text-xs text-gray-600"
								>メモ（任意）</label
							>
							<textarea
								id={FORM_ID.memo}
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
								disabled={!form.currentGame}
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
