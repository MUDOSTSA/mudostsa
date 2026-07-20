<script lang="ts">
	import { page } from '$app/state';
	import MaterialIcon from './MaterialIcon.svelte';

	let {
		links,
		children
	}: {
		links: {
			name: string;
			href: string;
		}[];
		children: () => any;
	} = $props();
	let currentPath = $derived(page.url.pathname);
</script>

<div class="h-full w-full flex-col overflow-hidden">
	<nav class="w-min-42 flex items-end overflow-auto px-2 pt-2">
		<div class="flex flex-1 gap-2 border-b border-b-slate-700 pb-2 lg:w-64">
			{#each links as link}
				<a
					href={link.href}
					class="flex items-center gap-3 truncate border-b-2 px-4 py-3 transition-colors duration-200 {currentPath ===
					link.href
						? 'border-blue-400 bg-blue-700/20 text-white backdrop-blur-xl '
						: 'border-transparent text-white/60 hover:bg-blue-700/20 hover:text-white'}"
				>
					<span class="text-sm">{link.name}</span>
				</a>
			{/each}
		</div>
	</nav>

	<!-- Content Area -->
	<div class="flex-1 overflow-auto">
		{@render children()}
	</div>
</div>

<style>
	div {
		box-sizing: border-box;
	}
</style>
