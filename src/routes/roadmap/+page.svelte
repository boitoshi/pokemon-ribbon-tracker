<script lang="ts">
	import { onMount } from 'svelte';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { setup } from '$lib/stores/setup.svelte';
	import RoadmapView from '$lib/components/roadmap/RoadmapView.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';

	onMount(() => {
		ribbonProgress.init();
		setup.init();
	});
</script>

<svelte:head>
	<title>ロードマップ | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<Toast />
<RoadmapView />
