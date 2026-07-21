<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4">
	<h1 class="glow text-3xl text-blue-300">ERROR {page.status}</h1>
	{#if page.error}
		<p class="font-mono text-gray-300">{page.error.message}</p>
	{/if}
</div>
