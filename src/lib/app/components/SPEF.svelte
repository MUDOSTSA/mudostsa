<script lang="ts">
	import {
		container,
		flexPrimaryButton,
		flexSecondaryButton,
		secondaryButton
	} from '$lib/app/lib/tailwindClasses';
	import { getFilePath, getSignedURL } from '../lib/supabase';
	import FinalSPEF from './FinalSPEF.svelte';
	import InitialSPEF from './InitialSPEF.svelte';

	let fileInput: HTMLInputElement;
	let error = $state('');
	let downloading = $state(false);

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

	function handleRemoveSignedSPEF() {
		if (pendingPDF.viewableLink) {
			URL.revokeObjectURL(pendingPDF.viewableLink);
		}

		pendingPDF.file = null;
		pendingPDF.viewableLink = null;
	}
	async function handleDownloadBlank() {
		downloading = true;
		try {
			const pathResult = await getFilePath('spef_latest');

			if (!pathResult.data) return;

			const { data: url } = await getSignedURL('documents', pathResult.data.file_path);
			if (!url) {
				throw new Error('No SPEF template found');
			}
			const response = await fetch(url?.signedUrl);

			if (!response.ok) {
				throw new Error(`Download failed: ${response.status}`);
			}

			const blob = await response.blob();

			const blobUrl = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = 'SPEF.pdf';

			document.body.appendChild(a);
			a.click();
			a.remove();

			URL.revokeObjectURL(blobUrl);
		} catch (e) {
			error =
				e instanceof Error ? e.message : 'An error occurred while downloading the SPEF template';
		} finally {
			downloading = false;
		}
	}
</script>

<div class={container}>
	<h2 class="text-lg font-semibold text-white">Semestral Progress and Engagement Form [SPEF]</h2>

	<div class="w-full px-4 py-8">
		<FinalSPEF />
	</div>
	<div class="mt-4 flex w-full flex-col gap-2 border-t border-t-white/10 py-4">
		<span class="text-sm text-white/50">
			In the event that the SPEF generation does not work, please download the blank SPEF by using
			the link below:
		</span>

		<button disabled={downloading} onclick={handleDownloadBlank} class={flexSecondaryButton}>
			{downloading ? 'Downloading' : 'Download blank SPEF'}
		</button>
	</div>
</div>
