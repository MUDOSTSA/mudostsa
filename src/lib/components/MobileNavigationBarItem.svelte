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

	let activeClass = $derived(active ? 'border-b-blue-400  ' : '');
</script>

<a
	{href}
	class={` z-40 mx-8 flex items-center justify-center border-b-2 border-transparent py-8 text-sm text-white hover:bg-blue-400 hover:text-black ${activeClass}`}
	>{@render children()}</a
>
