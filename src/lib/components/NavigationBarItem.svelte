<script lang="ts">
	let {
		href,
		active = false,
		children
	}: {
		href: string;
		active?: boolean;
		children: () => any;
	} = $props();

	let activeClass = $derived(active ? 'bg-blue-400 text-black ' : 'hover:text-blue-400');
</script>

<a {href} class={`px-4 py-2  ${activeClass}`}>{@render children()}</a>
