<script lang="ts">
	import {
		extractDataFromPDF,
		generateFinalSPEF,
		isAtLeastDaysAway
	} from '$lib/app/lib/helper_functions';

	import {
		fieldInput,
		formError,
		primaryButton,
		secondaryButton
	} from '$lib/app/lib/tailwindClasses';

	import type { AcademicTerm } from '$lib/app/lib/types';
	import { finalSpefSchema, type FinalSPEForm } from '$lib/app/lib/zod/spef_forms';

	import { onDestroy, onMount } from 'svelte';

	import { getAcademicTerms, getEventTitles } from '../lib/supabase';

	let {
		initialSpefFile
	}: {
		initialSpefFile: File;
	} = $props();

	let gradesInput: HTMLInputElement;
	let ecmInput: HTMLInputElement;

	let isSubmitting = $state(false);

	let data: FinalSPEForm = $state({
		name: '',
		studentNumber: '',
		contactNumber: '',
		emailAddress: '',
		programYear: '',
		termAppliedFor: '',
		recentlyAttendedEvent: '',
		isMember: false,
		spasId: '',
		landbankAccount: '',
		gradesPhoto: '',
		ecmPhoto: '',
		remainingNumberOfUnits: 0,
		latestGWA: 0
	});

	const fields: {
		label: string;
		placeholder: string;
		bindTo: keyof FinalSPEForm;
	}[] = [
		{
			label: 'Full Name',
			placeholder: 'Juan Dela Cruz',
			bindTo: 'name'
		},
		{
			label: 'Student Number',
			placeholder: '2025123456',
			bindTo: 'studentNumber'
		},
		{
			label: 'Contact Number',
			placeholder: '09123456789',
			bindTo: 'contactNumber'
		},
		{
			label: 'Email Address',
			placeholder: 'jdelacruz@mymail.mapua.edu.ph',
			bindTo: 'emailAddress'
		},
		{
			label: 'Program - Year',
			placeholder: 'CS - 3',
			bindTo: 'programYear'
		},
		{
			label: 'SPAS ID',
			placeholder: 'U 2025-00-12345',
			bindTo: 'spasId'
		},
		{
			label: 'Landbank Account',
			placeholder: 'SA 1234-1234-12',
			bindTo: 'landbankAccount'
		}
	];

	let terms: AcademicTerm[] = $state([]);
	let events: { title: string }[] = $state([]);

	let error = $state('');

	let generatedSPEFLink: string | null = $state(null);

	async function fillFromPDF() {
		try {
			const extractedData = await extractDataFromPDF(initialSpefFile);

			data = {
				...data,
				...extractedData
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
		}
	}

	async function handleSubmit() {
		isSubmitting = true;

		try {
			const result = finalSpefSchema.safeParse(data);

			if (!result.success) {
				throw new Error(result.error.issues[0].message);
			}

			generatedSPEFLink = await generateFinalSPEF(initialSpefFile, result.data);
		} catch (err) {
			console.error(err);
			error = err instanceof Error ? err.message : 'An unknown error occurred';
		} finally {
			isSubmitting = false;
		}
	}

	function handleClear() {
		data = {
			name: '',
			studentNumber: '',
			contactNumber: '',
			emailAddress: '',
			programYear: '',
			termAppliedFor: '',
			recentlyAttendedEvent: '',
			isMember: true,
			spasId: '',
			landbankAccount: '',
			gradesPhoto: '',
			ecmPhoto: '',
			remainingNumberOfUnits: 0,
			latestGWA: 0
		};

		if (generatedSPEFLink) {
			URL.revokeObjectURL(generatedSPEFLink);
		}

		generatedSPEFLink = null;
	}

	function handleDownload() {
		if (!generatedSPEFLink) return;

		const a = document.createElement('a');

		a.href = generatedSPEFLink;
		a.download = `${data.name.replaceAll(' ', '_')}_SPEF.pdf`;

		document.body.appendChild(a);
		a.click();
		a.remove();
	}

	function handlePhotoSelected(event: Event, type: 'grades' | 'ecm') {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		const url = URL.createObjectURL(file);

		if (type === 'grades') {
			if (data.gradesPhoto) {
				URL.revokeObjectURL(data.gradesPhoto);
			}

			data.gradesPhoto = url;
		} else {
			if (data.ecmPhoto) {
				URL.revokeObjectURL(data.ecmPhoto);
			}

			data.ecmPhoto = url;
		}

		input.value = '';
	}

	$effect(() => {
		fillFromPDF();
	});

	onMount(async () => {
		try {
			const [{ data: termsData, error: termsError }, { data: eventsData, error: eventsError }] =
				await Promise.all([getAcademicTerms(), getEventTitles()]);

			if (termsError) throw new Error(termsError.message);
			if (eventsError) throw new Error(eventsError.message);

			if (termsData) {
				if (termsData[0] && isAtLeastDaysAway(new Date(termsData[0].term_end), 30)) {
					terms = termsData ? [termsData[0]] : [];
				} else if (termsData[1]) {
					terms = termsData ? [termsData[1]] : [];
				} else {
					terms = [];
				}
			}
			events = eventsData ?? [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
		}
	});

	onDestroy(() => {
		if (generatedSPEFLink) {
			URL.revokeObjectURL(generatedSPEFLink);
		}

		if (data.gradesPhoto) {
			URL.revokeObjectURL(data.gradesPhoto);
		}

		if (data.ecmPhoto) {
			URL.revokeObjectURL(data.ecmPhoto);
		}
	});
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<input
		bind:this={gradesInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={(e) => handlePhotoSelected(e, 'grades')}
	/>

	<input
		bind:this={ecmInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={(e) => handlePhotoSelected(e, 'ecm')}
	/>

	{#if error}
		<div class={formError}>{error}</div>
	{/if}

	<div class="grid grid-cols-1 space-y-4 text-white lg:grid-cols-2">
		{#each fields as field}
			<div class="flex flex-col gap-1 px-4">
				<label for={field.bindTo} class="ml-[2px] flex flex-col gap-1">
					<span class="truncate text-sm">{field.label}</span>

					<input
						placeholder={field.placeholder}
						class={fieldInput}
						type="text"
						id={field.bindTo}
						name={field.bindTo}
						bind:value={data[field.bindTo]}
						disabled={isSubmitting}
						required
					/>
				</label>
			</div>
		{/each}

		<div class="flex flex-col gap-1 px-4">
			<label for="termAppliedFor" class="ml-[2px] flex flex-col gap-1">
				<span class="text-sm">Term Applied For</span>

				<select
					class={`${fieldInput} bg-blue-950`}
					id="termAppliedFor"
					name="termAppliedFor"
					bind:value={data.termAppliedFor}
					disabled={isSubmitting}
					required
				>
					<option value="" disabled selected>Select term</option>

					{#each terms as term}
						<option
							value={`Term ${term.term_number}, A.Y. ${term.academic_year}-${term.academic_year + 1}`}
						>
							{`Term ${term.term_number}, A.Y. ${term.academic_year}-${term.academic_year + 1}`}
						</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="flex flex-col gap-1 px-4">
			<label for="recentlyAttendedEvent" class="ml-[2px] flex flex-col gap-1">
				<span class="text-sm">Last Event Attended</span>

				<select
					class={`${fieldInput} bg-blue-950`}
					id="recentlyAttendedEvent"
					name="recentlyAttendedEvent"
					bind:value={data.recentlyAttendedEvent}
					disabled={isSubmitting}
				>
					<option value="" selected>None</option>

					{#each events as event}
						<option value={event.title}>{event.title}</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="grid grid-cols-2">
			<div class="flex flex-col gap-1 px-4">
				<label for="latestGWA" class="ml-[2px] flex flex-col gap-1">
					<span class="truncate text-sm">Latest GWA</span>

					<input
						placeholder="1.5"
						class={fieldInput}
						type="number"
						id="latestGWA"
						name="latestGWA"
						step="0.001"
						bind:value={data.latestGWA}
						disabled={isSubmitting}
						required
					/>
				</label>
			</div>

			<div class="flex flex-col gap-1 px-4">
				<label for="remainingNumberOfUnits" class="ml-[2px] flex flex-col gap-1">
					<span class="truncate text-sm">Remaining Number of Units</span>

					<input
						placeholder="0"
						class={fieldInput}
						type="number"
						id="remainingNumberOfUnits"
						name="remainingNumberOfUnits"
						bind:value={data.remainingNumberOfUnits}
						disabled={isSubmitting}
						required
					/>
				</label>
			</div>
		</div>
	</div>

	<div class="flex w-full flex-col items-center justify-center gap-4 py-8">
		{#if data.ecmPhoto || data.gradesPhoto}
			<div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
				<div
					class={`flex flex-col items-center justify-center space-y-4 ${
						data.gradesPhoto ? 'bg-gradient-to-t from-blue-800/10 to-blue-800/40' : ''
					} p-4`}
				>
					{#if data.gradesPhoto}
						<div class="flex h-100 items-center justify-center">
							<img
								src={data.gradesPhoto}
								alt="Grades"
								class="h-auto max-h-100 border-2 border-blue-400"
							/>
						</div>
					{/if}

					<button
						type="button"
						class={`${primaryButton} w-full`}
						onclick={() => gradesInput.click()}
					>
						{data.gradesPhoto ? 'Change Grades' : 'Upload Grades'}
					</button>
				</div>

				<div
					class={`flex flex-col items-center justify-center space-y-4 ${
						data.ecmPhoto ? 'bg-gradient-to-t from-blue-800/10 to-blue-800/40' : ''
					} p-4`}
				>
					{#if data.ecmPhoto}
						<div class="flex h-100 items-center justify-center">
							<img
								src={data.ecmPhoto}
								alt="eCM"
								class="h-auto max-h-100 border-2 border-blue-400"
							/>
						</div>
					{/if}

					<button type="button" class={`${primaryButton} w-full`} onclick={() => ecmInput.click()}>
						{data.ecmPhoto ? 'Change eCM' : 'Upload eCM'}
					</button>
				</div>
			</div>
		{:else}
			<div class="flex w-full flex-col gap-4 lg:w-1/3">
				<button type="button" class={`${primaryButton} w-full`} onclick={() => gradesInput.click()}>
					Upload Grades
				</button>

				<button type="button" class={`${primaryButton} w-full`} onclick={() => ecmInput.click()}>
					Upload eCM
				</button>
			</div>
		{/if}
	</div>

	<div class="mt-12 flex w-full items-center justify-center gap-2 text-white">
		<input
			type="checkbox"
			id="isMember"
			name="isMember"
			bind:checked={data.isMember}
			disabled={isSubmitting}
		/>

		<span class="text-white/50 italic"> I confirm that I am a member of the organization </span>
	</div>

	<div class="mt-4 flex w-full items-center justify-center gap-2">
		{#if generatedSPEFLink}
			<button type="button" class={primaryButton} onclick={handleDownload} disabled={isSubmitting}>
				Download SPEF
			</button>
		{/if}

		<button type="submit" class={primaryButton} disabled={isSubmitting}>
			{isSubmitting ? 'Generating...' : 'Generate SPEF'}
		</button>

		<button type="button" class={secondaryButton} onclick={handleClear} disabled={isSubmitting}>
			Clear
		</button>
	</div>

	{#if generatedSPEFLink}
		<iframe
			title="Preview"
			src={generatedSPEFLink}
			class="h-[500px] w-full border-2 border-blue-400"
		></iframe>
	{/if}
</form>
