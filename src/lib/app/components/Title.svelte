<script>
	let { className = '', children } = $props();
</script>

<span class="text-sm font-bold tracking-widest text-white uppercase {className}">
	{@render children()}
</span>
