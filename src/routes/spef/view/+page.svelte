<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAnonSubmissionsByStudentNumber, readRows } from '$lib/app/lib/supabase';
	import {
		fieldInput,
		flexPrimaryButton,
		formError,
		innerContent
	} from '$lib/app/lib/tailwindClasses';
	import { formatDateTime } from '$lib/app/lib/types';
	let submissionID = $state('');
	let error = $state('');
	let searchResults: any[] = $state([]);
	function isValidUUID(uuid: string): boolean {
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
	}
	async function handleCheck() {
		if (isValidUUID(submissionID)) {
			goto(`/spef/view/${submissionID}`);
		} else {
			const submissions = await getAnonSubmissionsByStudentNumber(submissionID);
			if (submissions.data?.length === 1) {
				goto(`/spef/view/${submissions.data[0].id}`);
			} else {
				searchResults = submissions.data ?? [];
			}
		}
	}
</script>

<div class="{innerContent} flex flex-col items-center justify-center">
	<form class="md flex h-full flex-col items-center justify-center gap-4 p-12 md:w-140">
		{#if error}
			<span class="{formError} w-full">{error}</span>
		{/if}
		<p class="text-white/50 italic">
			Please enter your submission ID or student number and we will check for your submission.
		</p>
		<input
			id="studentNumber"
			bind:value={submissionID}
			class={fieldInput}
			placeholder="Enter submission ID"
		/>
		<button onclick={handleCheck} class="{flexPrimaryButton} mt-12 w-full">Check</button>
	</form>
	<div class="flex w-1/2 flex-col space-y-4 text-white">
		{#if searchResults.length > 1}
			<h2 class="text-lg font-semibold">Several submissions found</h2>
		{/if}
		{#each searchResults as submission}
			<a
				href={`/spef/view/${submission.id}`}
				class="flex flex-col items-start justify-start border-l-2 border-l-blue-400 bg-gradient-to-l from-blue-800/50 p-4 backdrop-blur-xl transition-all duration-200 hover:border-l-14 hover:brightness-110"
			>
				<span class="flex items-center justify-start gap-4 text-sm tracking-widest uppercase"
					>Term {submission.academic_terms.term_number}, AY {submission.academic_terms
						.academic_year}-{submission.academic_terms.academic_year + 1}
					<span class="text-xs text-white/50"
						>Submitted on {formatDateTime(new Date(submission.created_at))}</span
					></span
				>
				<span class="text-xl text-blue-300">{submission.full_name}</span>
				<span class="text-xl text-blue-300">{submission.student_number}</span>
			</a>
		{/each}
	</div>
</div>
