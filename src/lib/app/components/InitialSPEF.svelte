<script lang="ts">
	import { generateInitialSPEF, isAtLeastDaysAway } from '$lib/app/lib/helper_functions';
	import { getAcademicTerms, getEventTitles } from '$lib/app/lib/supabase';
	import {
		fieldInput,
		flexPrimaryButton,
		flexSecondaryButton,
		formError,
		primaryButton,
		secondaryButton
	} from '$lib/app/lib/tailwindClasses';
	import type { AcademicTerm } from '$lib/app/lib/types';
	import { initialSpefSchema, type InitialSPEForm } from '$lib/app/lib/zod/spef_forms';
	import { onMount } from 'svelte';

	let isSubmitting = $state(false);
	let data: InitialSPEForm = $state({
		name: '',
		studentNumber: '',
		contactNumber: '',
		emailAddress: '',
		programYear: '',
		termAppliedFor: '',
		recentlyAttendedEvent: '',
		isMember: false,
		spasId: '',
		signature: ''
	});
	const fields: {
		label: string;
		placeholder: string;
		bindTo: keyof InitialSPEForm;
	}[] = [
		{ label: 'Full Name', placeholder: 'Juan Dela Cruz', bindTo: 'name' },
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
		}
	];
	let terms: AcademicTerm[] = $state([]);
	let events: { title: string }[] = $state([]);
	let error = $state<string>('');
	let generatedSPEFLink: string | null = $state(null);
	async function handleSubmit() {
		isSubmitting = true;
		try {
			const result = initialSpefSchema.safeParse(data);
			if (!result.success) {
				throw new Error(result.error.issues[0].message);
			}
			const link = await generateInitialSPEF(result.data);
			generatedSPEFLink = link;
		} catch (err) {
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
			signature: ''
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
	onMount(async () => {
		try {
			const { data: termsData, error: termsError } = await getAcademicTerms();
			if (termsError) {
				throw new Error(termsError.message);
			}
			if (termsData) {
				if (termsData[0] && isAtLeastDaysAway(new Date(termsData[0].term_end), 30)) {
					terms = termsData ? [termsData[0]] : [];
				} else if (termsData[1]) {
					terms = termsData ? [termsData[1]] : [];
				} else {
					terms = [];
				}
			}
			const { data: eventsData, error: eventsError } = await getEventTitles();
			if (eventsError) {
				throw new Error(eventsError.message);
			}
			if (eventsData) {
				events = eventsData;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
		}
	});
</script>

<form onsubmit={handleSubmit} class="space-y-4">
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
					<option value="" disabled selected> Select term </option>

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
				<span class="truncate text-sm">Last Event Attended</span>
				<select
					class={`${fieldInput} bg-blue-950`}
					id="recentlyAttendedEvent"
					name="recentlyAttendedEvent"
					bind:value={data.recentlyAttendedEvent}
					disabled={isSubmitting}
				>
					<option value="" selected>None</option>

					{#each events as event}
						<option value={event.title}>
							{event.title}
						</option>
					{/each}
				</select>
			</label>
		</div>
	</div>
	<div class="mt-12 flex w-full items-center justify-center gap-2 text-white">
		<input
			type="checkbox"
			id="isMember"
			name="isMember"
			bind:checked={data.isMember}
			disabled={isSubmitting}
		/>
		<span class="text-white/50 italic">I confirm that I am a member of the organization</span>
	</div>
	<div
		class="mt-4 flex w-full flex-col items-center justify-center gap-2 *:w-full md:flex-row md:*:w-fit"
	>
		{#if generatedSPEFLink}
			<button
				onclick={handleDownload}
				type="button"
				class={flexPrimaryButton}
				disabled={isSubmitting || !generatedSPEFLink}>Download SPEF</button
			>
		{/if}
		<button type="submit" class={flexPrimaryButton} disabled={isSubmitting}
			>{isSubmitting ? 'Generating' : 'Generate SPEF'}</button
		>
		<button onclick={handleClear} type="button" class={flexSecondaryButton} disabled={isSubmitting}
			>Clear</button
		>
	</div>
	{#if generatedSPEFLink}
		<iframe
			title="Preview"
			src={generatedSPEFLink}
			class="h-[500px] w-full border-2 border-blue-400"
		></iframe>
	{/if}
</form>
