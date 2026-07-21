<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		fieldInput,
		flexPrimaryButton,
		formError,
		innerContent
	} from '$lib/app/lib/tailwindClasses';
	let submissionReceipt = $state('');
	let error = $state('');
	function isValidReceipt(receipt: string): boolean {
		return /^submission-[A-Za-z]{20}-\d{13}$/.test(receipt);
	}
	async function handleCheck() {
		if (isValidReceipt(submissionReceipt)) {
			goto(`/spef/view/${submissionReceipt}`);
		} else {
			error = 'Invalid receipt';
		}
	}
</script>

<div class="{innerContent} flex flex-col items-center justify-center">
	<div class="md flex h-full flex-col items-center justify-center gap-4 p-12 md:w-140">
		{#if error}
			<span class="{formError} w-full">{error}</span>
		{/if}
		<p class="text-justify text-white/50 italic">
			Please enter your submission receipt and we will check for your submission. Your submission
			receipt is given to you upon submission and looks something like this:
		</p>
		<span class="text-center text-blue-300 italic"
			>submission-abcDEFghiJKLmnOPQrSt-1187828838328</span
		>
		<input
			id="receipt"
			bind:value={submissionReceipt}
			class={fieldInput}
			placeholder="Enter submission receipt"
			onkeydown={(e) => {
				if (e.key == 'Enter') {
					handleCheck();
				}
			}}
		/>
		<button
			onclick={handleCheck}
			onkeydown={(e) => {
				if (e.key == 'Enter') {
					handleCheck();
				}
			}}
			class="{flexPrimaryButton} mt-4 w-full">Check</button
		>
	</div>
</div>
