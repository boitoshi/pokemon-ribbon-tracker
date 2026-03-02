<script lang="ts">
	import { onMount } from 'svelte';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { setup } from '$lib/stores/setup.svelte';
	import QuickCheck from '$lib/components/tracker/QuickCheck.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';

	onMount(() => {
		ribbonProgress.init();
		setup.init();
	});
</script>

<svelte:head>
	<title>クイックチェック | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<Toast />
<QuickCheck />
