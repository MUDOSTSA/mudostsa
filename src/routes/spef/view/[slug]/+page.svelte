<script lang="ts">
	import { getSPEFLink } from '$lib/app/lib/supabase.js';
	import { container, innerContent } from '$lib/app/lib/tailwindClasses';
	import { formatDateTime } from '$lib/app/lib/types';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let { data } = $props();
	let spefLink = $state('');
	onMount(async () => {
		if (data.submission.path) {
			spefLink = await getSPEFLink(data.submission.path);
		}
	});
</script>

<div class={innerContent}>
	<div class="w-full space-y-12">
		<div class="flex flex-col text-lg text-white {container} justify_center items-center">
			<span class="text-sm text-white/50">{data.receipt}</span>
			<span class="text-sm text-white/50"
				>Submitted on {formatDateTime(new Date(data.submission.created_at))}</span
			>
			<span>{data.submission.full_name}</span>
			<span>{data.submission.student_number}</span>
			<span
				>Status: {#if data.submission.status.toLowerCase() == 'signed'}<span class="text-blue-400"
						>Signed</span
					>
				{:else}<span class="text-white/50 italic">Waiting for signature</span>{/if}</span
			>
			<span class="mt-12 text-center text-sm"
				>If there is a mistake in your submission, please email <a
					class="text-blue-400 hover:underline"
					href="mailto:internals@mudostsa.org">internals@mudostsa.org</a
				> to request for its removal.</span
			>
		</div>
		<div class={container}>
			{#if spefLink}
				<iframe
					in:fly={{ y: -10, duration: 200 }}
					src={spefLink}
					class="h-[70vh] w-full"
					title="SPEF Preview"
				></iframe>
			{/if}
		</div>
	</div>
</div>
