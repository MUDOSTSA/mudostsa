<script lang="ts">
	import { container, flexPrimaryButton, secondaryButton } from '$lib/app/lib/tailwindClasses';
	import FinalSPEF from './FinalSPEF.svelte';
	import InitialSPEF from './InitialSPEF.svelte';

	let fileInput: HTMLInputElement;

	let pendingPDF = $state<{
		file: File | null;
		viewableLink: string | null;
	}>({
		file: null,
		viewableLink: null
	});

	function handleFileSelected(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		if (pendingPDF.viewableLink) {
			URL.revokeObjectURL(pendingPDF.viewableLink);
		}

		pendingPDF.file = file;
		pendingPDF.viewableLink = URL.createObjectURL(file);

		// Allow selecting the same file again later
		input.value = '';
	}

	function handleUploadSignedSPEF() {
		fileInput.click();
	}

	function handleRemoveSignedSPEF() {
		if (pendingPDF.viewableLink) {
			URL.revokeObjectURL(pendingPDF.viewableLink);
		}

		pendingPDF.file = null;
		pendingPDF.viewableLink = null;
	}
</script>

<div class={container}>
	<h2 class="text-lg font-semibold text-white">Semestral Progress and Engagement Form [SPEF]</h2>

	<div class="mt-4 flex w-full flex-col gap-2 border-b border-b-white/10 py-4">
		<span class="text-sm text-white/50">
			If you already have a SPEF signed by MU-DOST SA Internals
		</span>

		<input
			bind:this={fileInput}
			type="file"
			accept="application/pdf,.pdf"
			class="hidden"
			onchange={handleFileSelected}
		/>

		<div class="flex flex-col items-center justify-center gap-2 *:w-full md:flex-row md:*:w-fit">
			<button onclick={handleUploadSignedSPEF} class={flexPrimaryButton}>
				{pendingPDF.file ? `Change PDF` : 'Upload Signed SPEF'}
			</button>

			{#if pendingPDF.file}
				<button onclick={handleRemoveSignedSPEF} class={secondaryButton}> Remove </button>
			{/if}
		</div>

		{#if pendingPDF.viewableLink}
			<iframe
				title="Preview"
				src={pendingPDF.viewableLink}
				class="h-[500px] w-full border-2 border-blue-400"
			></iframe>
		{/if}
	</div>

	<div class="w-full px-4 py-8">
		{#if pendingPDF.file}
			<FinalSPEF initialSpefFile={pendingPDF.file} />
		{:else}
			<InitialSPEF />
		{/if}
	</div>
</div>
