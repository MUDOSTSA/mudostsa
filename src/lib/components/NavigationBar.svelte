<script lang="ts">
	import { page } from '$app/state';
	import NavigationBarItem from './NavigationBarItem.svelte';

	let currentPath: string = $derived(page.url.pathname);
	$effect(() => {
		console.log(currentPath);
	});

	let navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/app', label: 'App' },
		{ href: '/resources', label: 'Resources' },
		{ href: '/events', label: 'Events' },
		{ href: '/contact', label: 'Contact' }
	];
</script>

<div
	class="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-gradient-to-b to-blue-900/50 px-4 py-12 backdrop-blur-2xl"
>
	<a href="/" class="flex items-center gap-2 px-4 text-white">
		<img src="/logo.svg" alt="" class="h-8" /><span
			>Mapúa University DOST Scholars' Association</span
		>
	</a>
	<input
		placeholder="Search... "
		class="no-ring w-1/3 border-b-2 border-b-blue-400 px-4 py-1 text-white focus:border-b-blue-300"
	/>
	<div class="flex items-center gap-8 px-4 text-white">
		{#each navItems as item}
			<NavigationBarItem href={item.href} active={currentPath === item.href}
				>{item.label}</NavigationBarItem
			>
		{/each}
	</div>
</div>
