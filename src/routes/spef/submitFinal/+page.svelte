<script>
	import { container, flexPrimaryButton, innerContent } from '$lib/app/lib/tailwindClasses';
</script>

<div class={innerContent}>
	<div class={container}>
		<h2 class="text-lg font-semibold text-white">Submission</h2>
		<div class="flex flex-col gap-4 p-4 text-white">
			<span
				>For the final SPEF, email to the Mapúa University Coordinator for the validation of your
				scholarship.</span
			>
			<a
				href="mailto:mucoordinator@sei.dost.gov.ph?subject=[MERIT/RA 7687, BATCH 20XX] SURNAME SPEF - TERM X, 20XX-XX?body=Good day! I am [NAME], a [MERIT/RA 7687] scholar of Mapúa University. I am submitting my SPEF for the term [TERM, YEAR]. Please find the attached SPEF for your validation. Thank you and have a great day!"
				class={flexPrimaryButton}
			>
				Email Coordinator [mucoordinator@sei.dost.gov.ph]
			</a>
		</div>
	</div>
</div>
