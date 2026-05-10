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
<div class="min-h-screen w-screen bg-[url('/bg.png')] bg-cover">
	<NavigationBar></NavigationBar>
	<div class="h-full w-full">{@render children()}</div>
</div>
