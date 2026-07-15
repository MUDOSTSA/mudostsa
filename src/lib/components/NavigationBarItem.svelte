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

	let activeClass = $derived(active ? 'border-b-blue-400  ' : 'hover:text-blue-300');
</script>

<a
	{href}
	class={`border-b-2 border-transparent px-2 py-2 text-sm whitespace-nowrap xl:px-4  ${activeClass}`}
	>{@render children()}</a
>
