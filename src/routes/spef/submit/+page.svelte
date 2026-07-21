<script lang="ts">
	import ConfirmationDialog from '$lib/app/components/dialogs/ConfirmationDialog.svelte';
	import InfoDialog from '$lib/app/components/dialogs/InfoDialog.svelte';
	import FileUploadField from '$lib/app/components/FileUploadField.svelte';
	import { extractDataFromPDF, readTerm } from '$lib/app/lib/helper_functions';
	import { getTerm, submitInitialSPEF } from '$lib/app/lib/supabase';
	import {
		container,
		flexPrimaryButton,
		formError,
		innerContent
	} from '$lib/app/lib/tailwindClasses';

	let blobUrl: string | null = $state(null);
	let spef: {
		name?: string | undefined;
		studentNumber?: string | undefined;
		contactNumber?: string | undefined;
		programYear?: string | undefined;
		emailAddress?: string | undefined;
		termAppliedFor?: string | undefined;
		isMember?: boolean | undefined;
		spasId?: string | undefined;
		recentlyAttendedEvent?: string | undefined;
	} | null = $state(null);
	let keyDisplay: { [key: string]: string } = {
		name: 'Full Name',
		studentNumber: 'Student Number',
		contactNumber: 'Contact Number',
		programYear: 'Program - Year',
		emailAddress: 'Email Address',
		termAppliedFor: 'Term Applied For',
		isMember: 'Member of MU-DOST SA',
		spasId: 'SPAS ID',
		recentlyAttendedEvent: 'Recently Attended Event'
	};
	let submissionError = $state('');
	let processingSubmission = $state(false);
	let submissionInfoShown = $state(false);
	let submissionReceipt = $state('');
	let file: File;
	let missingFields: [string, any][] = $state([]);
	$effect(() => {
		if (spef) {
			missingFields = Object.entries(spef).filter(
				([, value]) =>
					value === undefined ||
					value === null ||
					(typeof value === 'string' && value.trim() === '')
			);
		}
	});
	async function handleFilesChange(files: File[]) {
		if (files.length > 0) {
			file = files[0];
			const result = await extractDataFromPDF(file);
			blobUrl = URL.createObjectURL(file);
			if (!result.recentlyAttendedEvent) {
				result.recentlyAttendedEvent = 'None';
			}
			spef = { ...result };
		} else {
			spef = null;
			blobUrl = null;
		}
	}

	async function handleSubmit() {
		processingSubmission = true;
		submissionReceipt = '';
		if (spef?.termAppliedFor && file) {
			const term = readTerm(spef.termAppliedFor);
			const termRow = await getTerm(term);
			try {
				if (termRow.data && spef) {
					const result = await submitInitialSPEF(
						file,

						termRow.data,
						{
							fullName: spef.name ?? 'Unnamed',
							email: spef.emailAddress ?? 'Unknown email address',
							studentNumber: spef.studentNumber ?? 'No student number',
							programYear: spef.programYear ?? 'Unknown'
						}
					);
					submissionReceipt = result || 'NULL_SUBMISSION';
					submissionInfoShown = true;
				}
			} catch (e) {
				submissionError = e instanceof Error ? e.message : 'An unknown error occurred';
			}
		}
		processingSubmission = false;
	}
</script>

<InfoDialog title="SPEF Submitted" bind:shown={submissionInfoShown}>
	<div class="flex flex-col gap-2">
		<span
			>{`Your initial SPEF has been successfully submitted. Please save the following submission receipt in the case that you need support:`}</span
		>
		<span class="w-full text-center">{submissionReceipt}</span>
	</div>
</InfoDialog>
<div class={innerContent}>
	<FileUploadField
		message="Drag SPEF here or click to browse"
		allowedTypes={['application/pdf']}
		maxNumberOfFiles={1}
		onFilesChange={handleFilesChange}
	/>
	<div
		class={`${container} flex min-h-140 flex-col items-center justify-between gap-4 md:h-140 md:flex-row`}
	>
		<div
			class="flex h-full min-h-100 w-full items-center justify-center border-2 border-blue-400 bg-gradient-to-t from-blue-500/50 p-2 md:min-h-[0] md:w-1/3"
		>
			{#if blobUrl}
				<iframe title="SPEF Preview" src={blobUrl} class="h-100 w-full"></iframe>
			{:else}
				<span class="text-white">Upload SPEF for a preview</span>
			{/if}
		</div>
		<div class="flex h-full w-full flex-1 flex-col items-start justify-start overflow-hidden p-2">
			<div class="flex w-full flex-1 items-start justify-start truncate">
				{#if spef}
					<div class="flex flex-col gap-2 text-white">
						{#each Object.entries(spef) as [key, value]}
							<div class="grid grid-cols-1 md:grid-cols-2">
								<span class="text-blue-400 italic">{keyDisplay[key] || key}</span>
								{#if value || typeof value === 'boolean'}
									<span
										>{String(value) == 'true'
											? 'Yes'
											: String(value) == 'false'
												? 'No'
												: String(value)}</span
									>
								{:else}
									<span class="text-gray-400">Not provided</span>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex h-full w-full items-center justify-center">
						<span class="text-white/50 italic">No SPEF uploaded</span>
					</div>
				{/if}
			</div>
			<div class="mt-12 flex h-fit w-full flex-col gap-2">
				{#if missingFields.length > 0}
					<span class={formError}
						>Missing fields: {missingFields.map(([key]) => keyDisplay[key] || key).join(', ')}</span
					>
				{/if}
				{#if submissionError}
					<span class={formError}>{submissionError}</span>
				{/if}
				<button
					onclick={handleSubmit}
					class={flexPrimaryButton}
					disabled={missingFields.length > 0 || processingSubmission}
					>{processingSubmission ? 'Submitting' : 'Submit'}</button
				>
			</div>
		</div>
	</div>
</div>
