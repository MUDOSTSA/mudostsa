<script lang="ts">
	import { primaryButton } from '$lib/app/lib/tailwindClasses';
	import Dialog from './Dialog.svelte';
	let {
		title,
		children,
		shown = $bindable(false)
	}: {
		title: string;
		children: any;
		shown: boolean;
	} = $props();
</script>

<Dialog {title} bind:shown>
	<div class="flex w-full flex-col items-center justify-center space-y-12 p-4 px-36 pt-12">
		<div class={`text-white`}>{@render children()}</div>
		<div class="flex items-center justify-center gap-2">
			<button
				onclick={() => {
					shown = false;
				}}
				class={primaryButton}>OK</button
			>
		</div>
	</div>
</Dialog>
