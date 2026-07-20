<script lang="ts">
	import { innerContent } from '$lib/app/lib/tailwindClasses';
	import { formatDateTime } from '$lib/app/lib/types';

	let { data } = $props();
</script>

<div class={innerContent}>
	<div class="w-full">
		<div class="flex flex-col text-lg text-white">
			<span class="text-sm text-white/50">{data.submission.id}</span>
			<span class="text-sm text-white/50"
				>Submitted on {formatDateTime(new Date(data.submission.created_at))}</span
			>
			<span>{data.submission.full_name}</span>
			<span>{data.submission.student_number}</span>
			<span
				>Status: {#if data.submission.signed_path}<span class="text-blue-400">Signed</span>
				{:else}<span class="text-white/50 italic">Waiting for signature</span>{/if}</span
			>
		</div>
	</div>
</div>
