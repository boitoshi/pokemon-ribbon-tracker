<script lang="ts">
	import { onMount } from 'svelte';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { setup } from '$lib/stores/setup.svelte';
	import QuickCheck from '$lib/components/tracker/QuickCheck.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';

	let showHelp = $state(true);

	onMount(() => {
		ribbonProgress.init();
		setup.init();
		if (localStorage.getItem('quickHelperDismissed') === '1') {
			showHelp = false;
		}
	});

	function dismissHelp(): void {
		showHelp = false;
		localStorage.setItem('quickHelperDismissed', '1');
	}
</script>

<svelte:head>
	<title>クイックチェック | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<Toast />

<div class="mx-auto mb-3 max-w-3xl px-3 pt-3 md:px-4 md:pt-4">
	{#if showHelp}
		<div class="relative rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
			<button
				class="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-sky-400 hover:bg-sky-200 hover:text-sky-700"
				onclick={dismissHelp}
				aria-label="閉じる"
			>×</button>
			<p class="text-xs font-semibold text-sky-700">クイック機能の使い方</p>
			<p class="mt-1 text-sm text-sky-800">
				登録なしでも<strong>参照モード</strong>として使えます。
				マイポケモンを選択すると<strong>記録モード</strong>になり、取得状況や確認履歴を保存できます。
			</p>
		</div>
	{/if}
</div>

<QuickCheck />
