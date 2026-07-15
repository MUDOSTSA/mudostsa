<script lang="ts">
	import '../global.css';
	import NavigationBar from '$lib/components/NavigationBar.svelte';
	import './layout.css';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<title
		>{page.data.title
			? `${page.data.title} | MU-DOST SA`
			: "Mapúa University DOST Scholars' Association"}</title
	>
	<link rel="icon" href="/logo.svg" /></svelte:head
>
<div class="h-screen w-screen overflow-auto bg-[url('/bg.png')] bg-cover">
	<NavigationBar></NavigationBar>
	<div class="min-h-full w-full overflow-hidden px-4 pt-36 xl:px-12">{@render children()}</div>
</div>
