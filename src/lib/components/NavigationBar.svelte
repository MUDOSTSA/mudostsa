<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import MobileNavigationBarItem from './MobileNavigationBarItem.svelte';
	import NavigationBarItem from './NavigationBarItem.svelte';

	let currentPath: string = $derived(page.url.pathname);

	let navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/contact', label: 'Contact' },
		{ href: '/app', label: 'App' },
		{ href: '/resources', label: 'Resources' },
		{ href: '/events', label: 'Events' }
	];
	let collapsed = $state(true);

	$effect(() => {
		if (page.url.pathname) {
			collapsed = true;
		}
	});
</script>

<div
	class="fixed top-0 z-50 hidden h-16 w-full items-center justify-between gap-4 bg-gradient-to-b to-blue-900/50 px-4 py-10 backdrop-blur-2xl lg:flex"
>
	<a href="/" class=" flex min-w-92 items-center gap-2 px-4 text-white">
		<img src="/logo.svg" alt="" class="h-8" /><span class="text-sm whitespace-nowrap"
			>Mapúa University DOST Scholars' Association</span
		>
	</a>
	<input
		placeholder="Search... "
		class="no-ring w-1/4 min-w-24 border-b-2 border-b-blue-400 px-4 py-[0.45rem] text-sm text-white focus:border-b-blue-300"
	/>
	<div class="flex items-center gap-2 px-2 text-white xl:gap-8 xl:px-4">
		{#each navItems as item}
			<NavigationBarItem href={item.href} active={currentPath === item.href}
				>{item.label}</NavigationBarItem
			>
		{/each}
		<a
			href="/apply"
			class="border-2 border-blue-400 bg-blue-400 px-4 py-2 text-sm whitespace-nowrap text-black transition-colors hover:border-blue-300 hover:bg-blue-300"
			>Apply Now!</a
		>
	</div>
</div>
<div class="fixed flex p-4 lg:hidden">
	<button
		onclick={() => (collapsed = !collapsed)}
		class="absolute z-50 flex h-10 w-11 items-center justify-center border-2 border-blue-400 p-1 text-blue-400 transition-colors hover:bg-blue-400 hover:text-black"
		><Icon icon="menu" size={1.5} /></button
	>
	{#if !collapsed}
		<!-- collapsable mobile menu -->
		<div
			class="absolute top-0 left-0 z-49 h-screen w-screen space-y-8 bg-blue-950/60 px-4 py-20 backdrop-blur-lg"
		>
			<a
				href="/apply"
				class="flex h-16 items-center justify-center border-2 border-blue-400 bg-blue-400 text-sm text-black transition-colors hover:border-blue-300 hover:bg-blue-300"
				>Apply Now!</a
			>
			<div class="grid grid-cols-2 space-y-4 border-t border-t-white/10 py-4">
				{#each navItems as item}
					<MobileNavigationBarItem href={item.href} active={currentPath === item.href}>
						{item.label}
					</MobileNavigationBarItem>
				{/each}
			</div>
		</div>
	{/if}
</div>
