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
	let resubmitConfirmationDialogShown = $state(false);
	let processingSubmission = $state(false);
	let processingResubmission = $state(false);
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
	let confirmFunction: () => any = $state(() => {});
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
					submissionReceipt = result.data?.id || 'NULL_SUBMISSION';
					submissionInfoShown = true;
				}
			} catch (e) {
				console.error(e);
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
<ConfirmationDialog
	isProcessing={processingResubmission}
	bind:shown={resubmitConfirmationDialogShown}
	onConfirm={confirmFunction}
	title="Resubmit SPEF"
	summaryText="There is already an existing SPEF for this term. Resubmit?"
	confirmLabel="Resubmit"
></ConfirmationDialog>
<div class={innerContent}>
	<FileUploadField
		message="Drag SPEF here or click to browse"
		allowedTypes={['application/pdf']}
		maxNumberOfFiles={1}
		onFilesChange={handleFilesChange}
	/>
	<div class={`${container} flex h-140 items-center justify-between gap-4`}>
		<div
			class="flex h-full w-1/3 items-center justify-center border-2 border-blue-400 bg-gradient-to-t from-blue-500/50 p-2"
		>
			{#if blobUrl}
				<iframe title="SPEF Preview" src={blobUrl} class="h-full w-full"></iframe>
			{:else}
				<span class="text-white">Upload SPEF for a preview</span>
			{/if}
		</div>
		<div class="flex h-full w-full flex-1 flex-col items-start justify-start p-2">
			<div class="flex w-full flex-1 items-start justify-start">
				{#if spef}
					<div class="flex flex-col gap-2 text-white">
						{#each Object.entries(spef) as [key, value]}
							<div class="grid grid-cols-2">
								<span class="text-blue-400 italic">{keyDisplay[key] || key}</span>
								{#if value}
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
						<span class="text-white italic"
							>A summary of your SPEF will appear here once uploaded</span
						>
					</div>
				{/if}
			</div>
			<div class="flex h-fit w-full flex-col gap-2">
				{#if missingFields.length > 0}
					<span class={formError}
						>Missing fields: {missingFields.map(([key]) => keyDisplay[key] || key).join(', ')}</span
					>
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
